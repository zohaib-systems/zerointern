<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## ZeroIntern Deployment Context

- The project uses Supabase Auth and Supabase PostgreSQL. Do not migrate authentication to NextAuth without explicit approval.
- Supabase is integrated with the Vercel project. The production site is `https://zerointern.vercel.app`.
- The Supabase project URL is `https://xjviagepjrqnlvebsoec.supabase.co`.
- The application uses these runtime variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXTAUTH_SECRET`.
- Google OAuth credentials are configured in Supabase under Authentication > Providers > Google. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are not used by the current application code.
- Google OAuth uses the Supabase callback `https://xjviagepjrqnlvebsoec.supabase.co/auth/v1/callback`; the application callback is `https://zerointern.vercel.app/api/auth/callback`.
- Never print, commit, or expose `.env.local`, service-role keys, database passwords, OAuth client secrets, or JWT secrets.
- Supabase integration-generated environment variables should not be deleted casually. Only remove variables after confirming they are unused and not managed by the integration.
- After environment-variable changes in Vercel, redeploy the project. Validate with `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
