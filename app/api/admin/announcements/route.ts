import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { announcementSchema } from '@/lib/announcements';

export async function GET() {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('announcements').select('id, title, message, path, created_at').order('created_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: 'Unable to load announcements' }, { status: 500 });
  return NextResponse.json({ announcements: data }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = announcementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a title (up to 120 characters), message (up to 2,000 characters), and valid destination.' }, { status: 400 });
  const { data, error } = await supabase.from('announcements').insert(parsed.data).select('id, title, message, path, created_at').single();
  if (error) return NextResponse.json({ error: 'Unable to publish announcement. Please try again.' }, { status: 500 });
  return NextResponse.json({ announcement: data }, { status: 201 });
}
