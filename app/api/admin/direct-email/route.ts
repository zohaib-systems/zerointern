import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';

const directEmailSchema = z.object({
  userId: z.string().uuid(),
  subject: z.string().trim().min(1).max(150).regex(/^[^\r\n]+$/),
  message: z.string().trim().min(1).max(5000),
}).strict();

const searchPattern = /^[\p{L}\p{N} ._+'@-]{2,80}$/u;

export async function GET(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const term = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (!searchPattern.test(term)) return NextResponse.json({ users: [] }, { headers: { 'Cache-Control': 'no-store' } });

  const pattern = `%${term}%`;
  const [{ data: byEmail, error: emailError }, { data: byName, error: nameError }] = await Promise.all([
    supabase.from('users').select('id, name, email').ilike('email', pattern).not('email', 'is', null).limit(8),
    supabase.from('users').select('id, name, email').ilike('name', pattern).not('email', 'is', null).limit(8),
  ]);
  if (emailError || nameError) return NextResponse.json({ error: 'Unable to search users.' }, { status: 500 });
  const users = new Map<string, { id: string; name: string | null; email: string }>();
  for (const user of [...(byEmail ?? []), ...(byName ?? [])]) {
    if (typeof user.email === 'string' && user.email.trim()) users.set(user.id, { id: user.id, name: user.name, email: user.email });
  }
  return NextResponse.json({ users: [...users.values()].slice(0, 10) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return NextResponse.json({ error: 'Email delivery is not configured.' }, { status: 503 });

  const parsed = directEmailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Choose a user and enter a subject (up to 150 characters) and message (up to 5,000 characters).' }, { status: 400 });
  const { data: authResult, error: userError } = await supabase.auth.admin.getUserById(parsed.data.userId);
  if (userError || !authResult.user) return NextResponse.json({ error: 'The selected user could not be found.' }, { status: 404 });
  if (!authResult.user.email || !authResult.user.email_confirmed_at) return NextResponse.json({ error: 'The selected user does not have a confirmed email address.' }, { status: 400 });

  const { error } = await supabase.from('email_notifications').insert({
    user_id: authResult.user.id,
    kind: 'admin_message',
    title: parsed.data.subject,
    feedback: parsed.data.message,
    path: '/dashboard',
  });
  if (error) return NextResponse.json({ error: 'Unable to queue this email. Apply the admin email migration and try again.' }, { status: 500 });
  return NextResponse.json({ queued: true }, { status: 202 });
}
