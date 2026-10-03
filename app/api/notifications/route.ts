import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to view notifications' }, { status: 401 });
  const { data: announcements, error } = await supabase.from('announcements').select('id, title, message, path, created_at').order('created_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: 'Unable to load notifications. Please try again.' }, { status: 500 });
  const { data: reads, error: readError } = announcements?.length
    ? await supabase.from('announcement_reads').select('announcement_id').eq('user_id', user.id).in('announcement_id', announcements.map(item => item.id))
    : { data: [], error: null };
  if (error || readError) return NextResponse.json({ error: 'Unable to load notifications. Please try again.' }, { status: 500 });
  const readIds = new Set((reads ?? []).map(read => read.announcement_id));
  return NextResponse.json({ notifications: (announcements ?? []).map(item => ({ ...item, read: readIds.has(item.id) })) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to update notifications' }, { status: 401 });
  const parsed = z.object({ ids: z.array(z.uuid()).min(1).max(100) }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Choose valid notifications' }, { status: 400 });
  const { error } = await supabase.from('announcement_reads').upsert(
    [...new Set(parsed.data.ids)].map(id => ({ user_id: user.id, announcement_id: id })),
    { onConflict: 'user_id,announcement_id', ignoreDuplicates: true },
  );
  if (error) return NextResponse.json({ error: 'Unable to mark notifications read' }, { status: 500 });
  return NextResponse.json({ success: true });
}
