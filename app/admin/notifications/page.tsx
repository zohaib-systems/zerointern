import AnnouncementComposer from '@/components/admin/AnnouncementComposer';
export default function AdminNotificationsPage() {
  return <main className="min-h-screen bg-slate-900 text-white"><section className="mx-auto max-w-4xl px-6 py-12"><p className="text-sm uppercase tracking-widest text-cyan-300">Administration</p><h1 className="mt-3 text-4xl font-bold">Notify users</h1><p className="mt-4 text-slate-300">Publish an in-app announcement to all users. Users can read it from their dashboard bell, including when email notifications are off.</p><AnnouncementComposer /></section></main>;
}
