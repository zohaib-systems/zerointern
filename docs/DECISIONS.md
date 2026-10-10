# Decisions

These entries describe accepted choices. A future agent should explain a proposed change and obtain user authorization when it changes an explicit constraint.

| Decision | Reason / consequence |
| --- | --- |
| Keep Supabase Auth and PostgreSQL | Existing production integration, Google provider setup, and RLS depend on them. No migration to NextAuth without explicit approval. |
| Keep the separate admin JWT session | `NEXTAUTH_SECRET` signs this existing session; its name does not mean the application uses NextAuth for learner login. |
| Consult installed Next.js documentation | The project's Next.js release may differ from an agent's training knowledge. |
| Issue after four beginner approvals (2026-10-03) | User authorized the fix after confirming the missing certificate. Count distinct approved beginner projects in the same track; advanced work upgrades only the seal. Repair previously missed credentials with a separate idempotent SQL script. |
| Use one circular seal per certificate | Keep the original credential seal until four advanced projects in the same track are approved, then replace it with the circular advanced seal. The wide banner is not used in the PDF. |
| Compute seal level on certificate reads | Existing credentials upgrade visually without new records, dates, IDs, or hashes. No extra certificate-earned event is produced by this visual upgrade. |
| Give both seals the same 100-point rendering box | Beginner rendering was increased to match the advanced rendering box and position. |
| Keep email notifications opt-in | Users choose whether to receive approval, rejection, and certificate messages. Announcements can remind them without enabling email on their behalf. |
| Allow explicit admin email to one user (2026-10-10) | A separate admin action may email a selected confirmed account regardless of email preference. The worker bypass is limited to `admin_message`; automated approval, rejection, and certificate emails remain opt-in. This does not change preference settings or announcement behavior. |
| Use three professional email templates | Personalized greetings; congratulations for approval/certification; constructive rejection feedback and encouragement to resubmit. Provide an action button and preference link in each email. |
| Use an email queue and conservative retries | Record events with their business transactions; avoid automatic resends when SMTP acceptance is uncertain. |
| Store broadcasts once and reads per user | Avoid copying announcements to every account; unread state survives device changes. Broadcasts also appear for future users. |
| Publish announcements only through explicit admin action | The reminder preset fills a draft. It does not broadcast automatically. |
| Use standalone SQL files | Existing deployment workflow uses SQL Editor, not configured Supabase CLI migration history. Record each application separately. |
| Keep source-of-truth knowledge in the repository | Any AI tool can inspect the same rules, architecture, decisions, and evidence without depending on a prior chat. |

When adding a decision, record the date, scope, rationale, and affected source files when useful. Never record private credentials.
