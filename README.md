# ZeroIntern

ZeroIntern is a project-based learning platform: learners choose a track, submit practical projects for review, and receive verifiable certificates. Production: https://zerointern.vercel.app.

## Start here

- [AGENTS.md](AGENTS.md): instructions for every coding agent.
- [Architecture](docs/ARCHITECTURE.md): application flows and source locations.
- [Decisions](docs/DECISIONS.md): constraints and reasons behind product choices.
- [Status](docs/STATUS.md): implementation, validation, migration, and deployment evidence.
- [Reusable AI prompt](prompt.md): paste into a new AI session and add your task.

## Stack and features

Next.js 16.3.4 App Router, React 19, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL, PDFKit, QRCode, and Nodemailer. The lockfile is authoritative for installed versions.

- Google sign-in through Supabase and a separate admin session.
- Onboarding quiz, recommended/manual track selection, and track switching.
- JavaScript, Python, and Laravel tracks, each seeded with four beginner and four advanced projects.
- Enrollment, prerequisite checks, submission review, and resubmission with feedback.
- Certificate PDFs, public verification, and an advanced seal after four approved advanced projects in the same track.
- Opt-in approval, rejection, and certificate emails with personalized greetings.
- Dashboard announcement bell, unread/read state, and admin announcement publishing.

## Local setup

1. Use Node.js 20.9 or newer and npm; check the installed Next.js package requirements before changing Node versions.
2. Run `npm ci` to install dependencies from the lockfile.
3. Create a private `.env.local` with the variable names below. Obtain values through the configured providers; never commit or print them.
4. Configure Google in Supabase Authentication > Providers > Google. Google's authorized callback is the Supabase `/auth/v1/callback`; the application's local redirect is `http://localhost:3000/api/auth/callback`. Add application redirects to Supabase Authentication URL Configuration.
5. Apply the applicable SQL files in the order below. Existing databases should apply only missing changes after inspecting their schema.
6. Run `npx tsx scripts/seed.ts` only against the intended database. Seeding writes tracks and projects; it is not a read-only check.
7. Run `npm run dev`, then open http://localhost:3000.

### Environment variable names

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL; browser and server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key; access controlled by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged database operations |
| `NEXTAUTH_SECRET` | Existing custom admin JWT signing secret; not a NextAuth migration |
| `GMAIL_USER` | Optional server-only notification sender |
| `GMAIL_APP_PASSWORD` | Optional server-only Gmail app password |
| `EMAIL_WORKER_SECRET` | Optional server-only authorization for the email worker |

Google OAuth client credentials are configured in Supabase, not read from application environment variables. Never remove integration-managed variables without verifying ownership and usage.

### SQL order

This repository uses standalone SQL files, not configured Supabase CLI migration history. Apply them through the Supabase SQL Editor; `supabase migration up` does not automatically apply this layout.

1. `supabase/20260902_add_project_problem.sql` - base schema.
2. `supabase/20260906_add_advanced_project_metadata.sql` - difficulty and project metadata.
3. `supabase/20260907_add_onboarding.sql` - onboarding state and track selection.
4. `supabase/20260907_add_technology_preference.sql` - fourth quiz question.
5. `supabase/20260913_add_email_notifications.sql` - email preferences, queue, triggers, and claim function.
6. `supabase/20261003_add_in_app_notifications.sql` - announcements and per-user read receipts.

See [Supabase setup](supabase/README.md), [email activation](supabase/EMAIL_NOTIFICATIONS.md), and [announcement setup](NOTIFICATIONS.md). Database schema setup alone does not configure the Gmail sender or worker schedule.

## Commands and checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | TypeScript |
| `npm run build` | Production build; Google Fonts may require network access |
| `npm run start` | Serve the production build |
| `node scripts/check-certificate-issuance.mjs` | Beginner milestone, seal upgrade, and isolated repair checks |
| `node scripts/check-onboarding.mjs` | Onboarding logic |
| `node scripts/check-profile.mjs` | Profile checks; inspect script prerequisites before running |
| `node scripts/check-email-database.mjs` | Isolated email database tests with PGlite |
| `npx tsx scripts/check-email-notifications.ts` | Email templates and worker authorization |
| `node scripts/check-in-app-notifications.mjs` | Isolated announcement database/RLS tests |
| `node scripts/check-notifications-api.mjs` | Announcement API validation and authorization with mocks |

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution policy blocks the `.ps1` launchers. Some restricted environments also prevent `tsx` from reading OS user information; report that runner limitation separately from application failures.

Browser checks use mocked APIs and installed Microsoft Edge/Playwright; see their scripts and feature setup guides. Run `node scripts/check-notifications-browser.mjs` after building because it uses compiled CSS. Generated previews/screenshots stay under ignored `.next/`.

## Routes

| Area | Routes |
| --- | --- |
| Learning | `/explore`, `/explore/[trackId]`, `/onboarding`, `/dashboard`, `/dashboard/tracks/[trackId]`, `/dashboard/projects/[projectId]` |
| Account | `/auth/signin`, `/dashboard/settings` |
| Notifications | `/dashboard/notifications`, `/admin/notifications` |
| Admin | `/auth/admin-login`, `/admin`, `/admin/submissions`, `/admin/submissions/[submissionId]` |
| Credentials | `/dashboard/certificates`, `/certificate/verify/[code]` |
| PDF | `/api/certificates/download?code=...`; `&preview=true` provides a public inline preview |

## Certificate behavior

Admins approve projects individually. `lib/certificate.ts` issues a certificate once four distinct beginner projects in the same track have approved submissions for that learner; advanced projects do not delay issuance. Repeated or concurrent approval checks reuse an existing credential. Beginner approval also unlocks advanced projects through the existing prerequisite checks.

For learners whose four beginner approvals predate the fix, run `supabase/20261003_repair_beginner_certificates.sql` in Supabase SQL Editor. Review its eligible-count SELECT separately before running the full repair if desired. The repair creates only missing credentials, is safe to rerun, preserves existing IDs/dates/hashes, and timestamps newly issued certificates at repair time. Normal certificate email triggers apply to new credentials for opted-in learners.

For an existing certificate, `lib/certificateData.ts` selects the advanced seal once four distinct advanced projects in its track are approved. The PDF renders only one seal, using the same 100-point image box and position for either asset. Changing the rendered seal does not create a certificate or change its credential ID, issue date, or hash.

## Deployment

Apply required SQL before deploying dependent code. Vercel hosts the production application and has a Supabase integration. Production application callback: `https://zerointern.vercel.app/api/auth/callback`. Google provider callback: `https://xjviagepjrqnlvebsoec.supabase.co/auth/v1/callback`.

Redeploy after environment changes. Record deployment commit, migration evidence, and smoke-test results in [Status](docs/STATUS.md). A passing local build or a Git push alone is not evidence of a successful production deployment. Verify authentication, review/resubmission, certificate preview/verification, notification read state, and opted-in email delivery using test accounts.
