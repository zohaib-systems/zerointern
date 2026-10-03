'use client';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Announcement } from '@/lib/announcements';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [failed, setFailed] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch('/api/notifications', { cache: 'no-store' });
        if (!response.ok) throw new Error();
        const data: { notifications: Announcement[] } = await response.json();
        if (active) { setUnread(data.notifications.filter(item => !item.read).length); setFailed(false); }
      } catch { if (active) setFailed(true); }
    }
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 30000);
    const update = () => { void refresh(); };
    window.addEventListener('notifications-read', update);
    window.addEventListener('focus', update);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('notifications-read', update); window.removeEventListener('focus', update); };
  }, [pathname]);
  return <Link href="/dashboard/notifications" className="zi-notification-bell" aria-label={failed ? 'Notifications unavailable. Open to retry.' : `Notifications, ${unread} unread`} title={failed ? 'Unable to refresh notifications' : 'Notifications'}>
    <Bell size={21} aria-hidden="true" /><span>Notifications</span>
    {unread > 0 && <span className="zi-notification-count" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
    {failed && <span aria-hidden="true">!</span>}
  </Link>;
}
