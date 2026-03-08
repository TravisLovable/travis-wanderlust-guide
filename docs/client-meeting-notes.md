# Pre-meeting checklist (review together)

Quick items to run through with the client and resolve live.

---

## 1. Supabase: `OPEN_AI_KEY` secret

- **Check:** Confirm the project has a secret named **`OPEN_AI_KEY`** in Supabase.
- **Where:** [Supabase → Project → Edge Functions → Secrets](https://supabase.com/dashboard/project/jmoysndoynjokwrelpfk/functions/secrets)
- **Action:** If it’s missing, add it (value = their OpenAI API key).

---

## 2. Time/date secret key & backend access

- **Question:** The time/date secret key is created on the backend — was access/permissions changed as intended?
- **Action:** Verify with the client that the backend has the right access to that secret and that nothing was locked down incorrectly.

---

## 3. Google Maps: allow Netlify URL (RefererNotAllowedMapError)

So the production site can load the Maps/Places script:

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the project that has the Places/Maps key.
2. Go to **APIs & Services → Credentials**.
3. Click the API key used for the site (the one in `VITE_GOOGLE_PLACES_KEY`).
4. Under **Application restrictions**:
   - Choose **HTTP referrers (websites)**.
   - Under **Website restrictions**, click **Add an item** and add:
     - `https://travismvp.netlify.app/*`
     - (Optional) `http://localhost:*/*` for local dev.
5. Save.

---

*Use this as a live checklist; resolve each item together in the meeting.*
