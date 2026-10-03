import Link from 'next/link';
import { Bell } from 'lucide-react';
import { redirect } from 'next/navigation';
import { checkAdmin } from '@/lib/auth';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!await checkAdmin()) redirect('/auth/admin-login');
  return <><nav className="flex items-center justify-between gap-4 border-b border-slate-600 bg-slate-900 px-6 py-4 text-white" aria-label="Admin navigation"><Link href="/admin" className="font-semibold">ZeroIntern Admin</Link><Link href="/admin/notifications" className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2"><Bell size={20} aria-hidden="true" />Notify users</Link></nav>{children}</>;
}
