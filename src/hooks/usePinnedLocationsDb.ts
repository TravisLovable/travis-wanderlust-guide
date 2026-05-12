import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PinnedLocationRow = {
  id: string;
  user_id: string;
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  country_code: string | null;
  region: string | null;
  place_id: string | null;
  pinned_at: string;
  created_at: string;
  updated_at: string;
};

/**
 * Read the current user's pinned locations from public.pinned_locations.
 *
 * RLS-aware: the table's SELECT policy is
 *   user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
 * so a plain `select('*')` returns only the authed user's rows. When the
 * user is signed out we skip the query entirely and return an empty list.
 *
 * Imperative useState/useEffect to match the codebase convention (no
 * TanStack Query usage yet, per audit).
 */
export function usePinnedLocationsDb() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PinnedLocationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    if (!user) {
      setRows([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from("pinned_locations")
      .select("*")
      .order("pinned_at", { ascending: false });
    setLoading(false);
    if (queryError) {
      setError(queryError.message);
      setRows([]);
      return;
    }
    setRows((data ?? []) as PinnedLocationRow[]);
  }, [user]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  return { rows, loading, error, refetch: fetchRows };
}
