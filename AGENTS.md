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

## Repository handoff workflow

- Before implementation, read `README.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and `docs/STATUS.md`. The reusable starting prompt is in `prompt.md`.
- Inspect Git status and the relevant implementation before editing. Preserve user changes and avoid unrelated refactoring.
- Confirmed product rule: admins approve projects individually; a certificate is issued after four distinct beginner project approvals in the same track. The seal then upgrades only after four advanced projects in the same track are approved. The authorized beginner issuance fix and repair steps are recorded in `docs/STATUS.md`. Do not silently alter issuance during unrelated work.
- Keep exactly one certificate seal in the PDF. Preserve credential IDs, dates, and hashes when changing seal presentation.
- Keep notification email opt-in intact. Admin announcements do not enable email preferences or send email automatically.
- Run checks appropriate to the change. Application changes require lint, TypeScript, and production build plus relevant existing feature checks. Documentation-only changes need link/path and diff review; do not add redundant application tests.
- Update status after meaningful work; update architecture and decisions when their facts change. Record checks actually performed and distinguish local results, user-reported completion, and verified production state.
- Track SQL application and deployment separately. Never infer either from a commit or a Git push. No secret values belong in the deployment record.
