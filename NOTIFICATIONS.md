# In-app announcements

Before deploying this feature, run `supabase/20261003_add_in_app_notifications.sql` in the Supabase SQL Editor. It is safe to rerun. No new environment variables are required.

The dashboard bell opens `/dashboard/notifications`. The count refreshes every 30 seconds while the tab is visible, on window focus, and after marking notifications read. Each user has independent read receipts. The inbox displays the latest 100 announcements.

Admins open the bell labeled **Notify users**, then choose **Use email reminder** to prepare the reminder, review the preview, and click **Publish to all users**. The reminder links to `/dashboard/settings`, where users can choose to enable email notifications. Publishing does not send email or change anyone's email preferences. The separate **Send an email to a user** form queues a message for one selected account, regardless of that account's email preference; it does not alter the existing announcement flow or the user's preference.

Announcements are visible to all authenticated users, including users who join later. Admin API writes require the existing admin session and same-origin requests. Row-level security prevents users from publishing announcements or reading/changing another user's read receipts.

Validation: `node scripts/check-in-app-notifications.mjs`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

Additional checks: `node scripts/check-notifications-api.mjs` validates API authorization and inputs. After a production build, `node scripts/check-notifications-browser.mjs` checks the UI with mocked API responses; it requires Playwright (installed locally or available in the Windows npm cache) and Microsoft Edge. Browser check artifacts stay under `.next/`.
