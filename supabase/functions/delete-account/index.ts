// delete-account — in-app account + data deletion (Apple Guideline 5.1.1(v)).
//
// Identity comes ONLY from the verified JWT (auth.getUser on the caller's token).
// The request body is never read for a user id, so a caller can't delete anyone
// but themselves. Runs with the service-role key (a Supabase secret, never shipped
// to the client) to remove every store of the user's data, children-first:
//   1. storage objects owned by the uid (enumerated, not path-guessed)
//   2. public.pinned_locations (explicit; also ON DELETE CASCADE from users)
//   3. public.users (the profile row — onboarding + preferences live here as columns)
//   4. the auth user itself (LAST, so the steps above are retryable on partial failure)
//
// Each step is idempotent (deleting already-gone rows is a no-op) and its result is
// returned + logged, so a mid-way failure is a safe retry rather than a half-state.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // --- Authn: derive the user from the verified token. Never from the body. ---
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json(401, { error: "Missing or malformed Authorization header" });
  }
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: userErr } = await caller.auth.getUser();
  if (userErr || !user) return json(401, { error: "Invalid or expired token" });
  const uid = user.id; // the ONLY source of identity

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const steps: Record<string, unknown> = {};
  try {
    // 1) Storage: enumerate every object owned by this uid (the `storage` schema
    //    isn't exposed to PostgREST, so a locked-down SECURITY DEFINER helper reads
    //    storage.objects by owner). Group by bucket and remove via the Storage API
    //    so the underlying files go too — not just the rows.
    const { data: objects, error: listErr } = await admin
      .rpc("list_owned_storage_objects", { p_uid: uid });
    if (listErr) throw new Error(`storage list: ${listErr.message}`);

    const byBucket = new Map<string, string[]>();
    for (const o of objects ?? []) {
      if (!o.bucket_id || !o.name) continue;
      const names = byBucket.get(o.bucket_id) ?? [];
      names.push(o.name);
      byBucket.set(o.bucket_id, names);
    }
    let storageRemoved = 0;
    for (const [bucket, names] of byBucket) {
      const { error: rmErr } = await admin.storage.from(bucket).remove(names);
      if (rmErr) throw new Error(`storage remove (${bucket}): ${rmErr.message}`);
      storageRemoved += names.length;
    }
    steps.storage_objects_removed = storageRemoved;

    // Resolve the profile row's primary key (pinned_locations references users.id).
    const { data: profile, error: profErr } = await admin
      .from("users")
      .select("id")
      .eq("auth_id", uid)
      .maybeSingle();
    if (profErr) throw new Error(`profile lookup: ${profErr.message}`);

    // 2) pinned_locations (explicit; cascade would also cover it).
    if (profile?.id) {
      const { error: pinErr, count } = await admin
        .from("pinned_locations")
        .delete({ count: "exact" })
        .eq("user_id", profile.id);
      if (pinErr) throw new Error(`pinned_locations delete: ${pinErr.message}`);
      steps.pinned_locations_deleted = count ?? 0;
    } else {
      steps.pinned_locations_deleted = 0;
    }

    // 3) public.users profile row (by auth_id).
    const { error: usersErr, count: usersCount } = await admin
      .from("users")
      .delete({ count: "exact" })
      .eq("auth_id", uid);
    if (usersErr) throw new Error(`users delete: ${usersErr.message}`);
    steps.users_rows_deleted = usersCount ?? 0;

    // 4) The auth user itself — LAST.
    const { error: authErr } = await admin.auth.admin.deleteUser(uid);
    if (authErr) throw new Error(`auth deleteUser: ${authErr.message}`);
    steps.auth_user_deleted = true;

    console.log(`[delete-account] success uid=${uid}`, steps);
    return json(200, { ok: true, steps });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Partial-failure: log exactly how far we got. Earlier steps are idempotent,
    // so the caller can safely retry; the client keeps the session on a non-200.
    console.error(`[delete-account] FAILED uid=${uid} completed=`, steps, "error:", message);
    return json(500, { ok: false, steps, error: message });
  }
});
