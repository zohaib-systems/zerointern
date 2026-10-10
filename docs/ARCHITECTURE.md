# Architecture

## Application boundaries

Next.js App Router pages and route handlers live in `app/`; reusable UI lives in `components/`; business logic and provider clients live in `lib/`. Shared styles are in `styles/`. SQL setup files live in `supabase/`; development checks and seeding live in `scripts/`.

Use the installed guides in `node_modules/next/dist/docs/` before changing Next.js code. Prefer existing patterns over assuming APIs from another release.

## Authentication and access

- Learners authenticate through Supabase Auth with Google. `app/api/auth/callback/route.ts` handles the application callback and maintains `public.users` profiles.
- `lib/supabase/client.ts` is the browser client; `server.ts` uses request cookies. `service.ts` is the privileged server-only client.
- `lib/auth.ts` validates learner identity with Supabase and verifies the separate `zerointern_admin` JWT cookie. `app/api/auth/admin-login/route.ts` checks a bcrypt password hash in `admins` and signs the admin cookie with `NEXTAUTH_SECRET`.
- `lib/admin.ts` returns a privileged client only after admin verification. Admin pages are guarded by `app/admin/layout.tsx`; APIs still require their own authorization.
- Supabase RLS and application access checks both matter. Never move service credentials into client components.

## Onboarding and projects

`lib/onboarding.ts` contains quiz validation and recommendation rules; `lib/onboarding-server.ts` loads profiles, responses, and track choices. Four questions cover experience, goal, technology preference, and pace. An explicit technology choice takes precedence in recommendation; pace is an estimate.

The SQL function `select_onboarding_track` atomically updates the active track and enrollment. The dashboard layout requires completed onboarding and an active track. Switching tracks preserves previous work.

`lib/seedData.ts` defines beginner and advanced projects. `scripts/seed.ts` writes them with real track UUIDs. `lib/projectAccess.ts` verifies enrollment and beginner prerequisites before advanced project access. Submission APIs use that check before accepting repository/live URLs. Rejected submissions can return to `PENDING`; pending/approved submissions cannot be resubmitted through that flow.

## Reviews and certificates

Admin review handlers are under `app/api/submissions/[id]/approve` and `reject`; UI is in `components/admin/`. Review feedback is stored as `admin_notes`. `/admin/submissions` also has a Certificates tab that counts issued credentials, lists them by issue date, and links to the existing inline PDF preview endpoint.

- `lib/certificate.ts`: issuance, verification codes, SHA-256 integrity hash. Issuance requires four distinct approved beginner projects in the same track. Repeated checks reuse the existing certificate; a concurrent insert conflict returns the winning credential.
- `lib/certificateData.ts`: loads approved projects belonging to the certificate's track, checks integrity/status, and derives `sealLevel` from four approved advanced projects.
- `lib/certificatePdf.ts`: renders the PDF, QR verification link, and exactly one seal. Both seals use a 100-point image box at the same coordinates; PNG padding may differ.
- `public/certificate-seal.png` and `public/certificate-seal-advanced.png`: runtime assets; keep both in Git.
- `/certificate/verify/[code]`: public verification. The download API requires learner authentication for downloads but allows a public inline preview.

Seal selection is calculated when loading an existing certificate. It does not update the certificate record, issue a second certificate, or change the integrity hash. The one-time `20261003_repair_beginner_certificates.sql` repair creates missing certificates for already eligible learners without changing existing credentials.

## Email notifications

The email SQL migration adds `notification_preferences`, `email_notifications`, `email_daily_budget`, review/certificate triggers, and `claim_email_notification`. Email preferences default off. Events are queued transactionally only for opted-in users; old events are not backfilled.

`app/api/notifications/process/route.ts` checks its bearer secret, claims one event, rechecks opt-in, reads the confirmed Auth recipient, resolves their profile/Auth name, and sends through Gmail SMTP. `lib/email-delivery.ts` defines transport and cautious retry behavior. `lib/email-template.ts` creates matching HTML/plain-text approval, rejection, and certificate emails; rejection feedback is escaped and preserves line breaks. Emails link to the relevant project/certificates and email settings.

`/admin/notifications` keeps its existing all-user announcement composer and history. A separate one-recipient email form uses `/api/admin/direct-email` to search users and enqueue an `admin_message`. The worker bypasses the email preference lookup only for this explicit admin message type; all approval, rejection, and certificate events still require opt-in. `20261010_add_admin_email_messages.sql` adds the queue kind constraint. The admin message template escapes user-provided content and does not modify preferences.

The existing claim function caps attempts at 100 per UTC day. Ambiguous SMTP acceptance is not automatically resent. Gmail acceptance is not proof of inbox delivery. Configuration and Cron/Vault scheduling are described in `supabase/EMAIL_NOTIFICATIONS.md`.

## In-app announcements

Admins publish title, message, and an allowlisted dashboard destination through `/api/admin/announcements`. The composer at `/admin/notifications` offers a draft email-settings reminder and history; publishing is explicit.

`announcements` stores global broadcasts; `announcement_reads` stores one read receipt per user/announcement. Authenticated users may read broadcasts and insert their own receipts, but cannot publish or access another user's receipts. Writes require same-origin requests; admin writes also require the admin session.

The dashboard bell polls `/api/notifications` every 30 seconds while visible, on focus/navigation, and after marking read. The inbox shows the latest 100 announcements. Broadcasts are visible to future users as well. Announcements do not send emails or change opt-in settings.

## Operational boundaries

No secret values belong in repository documentation. Apply standalone SQL through Supabase SQL Editor before dependent deployments. Keep seeding, live schema changes, announcements, and real email sends separate from isolated validation. Record actual remote evidence in STATUS.md; do not infer deployment from commits.
