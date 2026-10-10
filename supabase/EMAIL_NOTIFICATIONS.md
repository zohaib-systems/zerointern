# Email notifications activation

The app sends project approval, changes-requested, and certificate-earned emails
through Gmail SMTP. Supabase Auth and Google sign-in are unchanged. Preferences
default to off; no historical emails are backfilled.

## Configure Gmail and Vercel

1. Enable Google 2-Step Verification for `zerointer.dev@gmail.com`, then create an
   app password: https://myaccount.google.com/apppasswords . App passwords may
   be unavailable under some Google account/security configurations. Use an app
   password, never your normal Google password.
2. Add these server-only environment variables in Vercel's production settings:
   - `GMAIL_USER`: `zerointer.dev@gmail.com`
   - `GMAIL_APP_PASSWORD`: the app password
   - `EMAIL_WORKER_SECRET`: a securely generated random secret (at least 32 bytes)
3. Keep credentials out of source control, SQL files, screenshots, and chat.
   Do not change the integration-managed Supabase variables.
4. Apply `20260913_add_email_notifications.sql` in the Supabase SQL Editor before
   deploying the code. Before deploying the separate direct admin email feature,
   also apply `20261010_add_admin_email_messages.sql`. This repo uses standalone
   SQL migrations.
5. Redeploy Vercel after configuring the variables.

Google requirements: https://support.google.com/accounts/answer/185833
Gmail SMTP guidance and limits: https://nodemailer.com/guides/using-gmail

## Schedule the worker

Enable Supabase Cron (`pg_cron`) and `pg_net` in the dashboard. In Supabase Vault,
create a secret named `email_worker_secret` with the SAME value as Vercel's
`EMAIL_WORKER_SECRET`. Do this privately in the dashboard, not a committed script.

Run the following once in the Supabase SQL Editor after deployment. Check Cron
for an existing `zerointern-email-worker` job before scheduling it again.

```sql
select cron.schedule(
  'zerointern-email-worker', '* * * * *',
  $job$
    select net.http_post(
      url := 'https://zerointern.vercel.app/api/notifications/process',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets
          where name = 'email_worker_secret'
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $job$
);
```

Each invocation claims one email. The database serializes claims and limits the
worker to 100 attempts per UTC day, including retries and skipped messages.
Gmail's own limits and other mailbox activity still apply. Expected delivery is
within a few minutes at low volume; backlog waits when the daily cap is reached.
Scheduler reference: https://supabase.com/docs/guides/functions/schedule-functions

## Reliability and operations

- RLS restricts preferences to their owner; only the service role accesses the queue.
- Database triggers enqueue opted-in events in the same transaction as review
  updates/certificate inserts. Concurrent review updates use conditional writes.
- The worker rechecks preferences for approval, rejection, and certificate events
  and reads the current confirmed Auth email. Explicit `admin_message` events are
  the sole preference bypass and are created only by the admin-only endpoint.
- Temporary SMTP refusals retry up to five attempts with increasing delay.
- SMTP does not provide exactly-once delivery. Ambiguous timeouts and interrupted
  workers become `failed` for manual inspection, rather than automatic resending.
  Message IDs are stable, but are not a guarantee of recipient deduplication.
- `sent` means Gmail accepted the email, not confirmed inbox delivery. Gmail has
  no provider delivery webhook here; monitor its inbox for bounces and complaints.
  Disable the affected user's preference before retrying bounced mail.
- Inspect queue counts in Supabase (do not expose queue contents publicly):

```sql
select status, count(*) from public.email_notifications group by status;
```

If an email is `failed`, inspect the sending mailbox before manually requeueing
that specific row. Resolve credentials/recipient errors first. Never bulk retry
ambiguous sends. Old queue records contain review feedback; periodically delete
terminal records older than your chosen retention period (recommended 30 days).

## Validation

```powershell
npx.cmd tsx scripts/check-email-notifications.ts
node scripts/check-email-database.mjs
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

After activation, use test accounts to verify:

1. Default off, save on, refresh, and verify persistence. Another account cannot
   read/change the first account's preferences or read/claim queue records.
2. Approval/rejection creates one pending event; concurrent review attempts create
   one event. Reject, resubmit, and reject again creates a new event.
3. Certificate insertion creates one event; reading an existing certificate does not.
4. Opt-out before processing skips the pending email. Unconfirmed/missing recipients
   are skipped. Toggle changes during an already in-flight SMTP send cannot cancel it.
5. Invoke the protected worker with its secret and verify the actual inbox, links,
   feedback formatting, and queue status. No secret/wrong secret returns 401.
6. In a staging database, verify concurrent claims differ, the daily budget stops
   claims at 100, and abandoned leases become failed after five minutes.

Live SQL/RLS and Gmail delivery checks require the migration, deployment, and
private credentials; local template tests alone do not validate them.
