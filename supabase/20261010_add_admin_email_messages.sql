begin;

alter table public.email_notifications
  drop constraint if exists email_notifications_kind_check;

alter table public.email_notifications
  add constraint email_notifications_kind_check
  check (kind in ('approved', 'rejected', 'certificate', 'admin_message'));

commit;
