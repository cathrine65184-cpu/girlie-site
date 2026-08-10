# Girlie Private Friendship Archive — secure launch checklist

The P0 interface is in the React app. Private cloud saving and AI interview replies activate only after this small Supabase setup. This protects user stories and keeps the DeepSeek key off GitHub Pages.

## 1. Rotate the exposed DeepSeek key

The key was pasted into chat, so revoke it in the DeepSeek console and create a fresh one. Do not commit it or add it to `VITE_*` variables: Vite exposes those values to every website visitor.

## 2. Apply the private schema

In the existing Supabase project, run [friendship-archive.sql](supabase/friendship-archive.sql) in **SQL Editor**. It creates the archive, memory, story-version, and time-capsule tables with owner-only RLS policies.

## 3. Deploy the server-side archivist

From this repository, authenticate and link your existing project, then set the secret and deploy:

```bash
npx supabase login
npx supabase link --project-ref xvdsrmagrultbhmqihuq
npx supabase secrets set DEEPSEEK_API_KEY="your-rotated-key"
npx supabase functions deploy friendship-archivist
```

The function verifies the signed-in user before it sends a request to DeepSeek. It permits the deployed Girlie origin and local Vite preview only. DeepSeek supports the OpenAI-compatible chat-completions endpoint and JSON mode, which the function uses for structured, fact-only archive extraction. [DeepSeek JSON mode](https://api-docs.deepseek.com/guides/json_mode/)

## 4. Authentication and privacy

Keep email/password authentication enabled in Supabase. The app’s public anonymous key is safe in the frontend; the RLS policies, not obscurity, enforce privacy. A new archive starts as a browser-only private draft. After sign-in it synchronizes to the account and remains private unless a future explicit sharing action is implemented.

## What is in P0 now

- Conversational Friendship Interview with a privacy-respecting skip path.
- Private, editable Friendship Story with preserved versions.
- Private Room with archive shelves and an Add a Memory continuation flow.
- Timeline, important places, friendship objects, keywords, quote, and time-capsule surfaces.
- Safe local-draft fallback before cloud setup.

Public sharing, global map, shop, and AI short film remain intentionally out of P0.
