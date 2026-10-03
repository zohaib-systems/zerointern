import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createEmailTransport, deliveryFailure } from "@/lib/email-delivery";
import { emailTemplate } from "@/lib/email-template";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.EMAIL_WORKER_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const provided = Buffer.from(authorization);
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({ error: "Email delivery is not configured" }, { status: 503 });
  }
  const supabase = createServiceClient();
  const { data: events, error } = await supabase.rpc("claim_email_notification");
  if (error) return NextResponse.json({ error: "Unable to claim notification" }, { status: 500 });
  const event = events?.[0];
  if (!event) return NextResponse.json({ processed: 0 });

  async function finish(values: Record<string, unknown>) {
    const { error: updateError } = await supabase.from("email_notifications").update(values).eq("id", event.id).eq("status", "processing");
    if (updateError) throw new Error("Unable to record delivery result");
  }

  try {
    const { data: preference, error: preferenceError } = await supabase.from("notification_preferences").select("email_enabled").eq("user_id", event.user_id).maybeSingle();
    if (preferenceError) throw new Error("Preference lookup failed");
    if (!preference?.email_enabled) {
      await finish({ status: "skipped" });
      return NextResponse.json({ processed: 1 });
    }
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(event.user_id);
    if (userError) throw new Error("Recipient lookup failed");
    if (!user?.email || !user.email_confirmed_at) {
      await finish({ status: "skipped" });
      return NextResponse.json({ processed: 1 });
    }
    const { data: profile, error: profileError } = await supabase.from("users").select("name").eq("id", event.user_id).maybeSingle();
    if (profileError) throw new Error("Recipient name lookup failed");
    const metadataName = user.user_metadata?.full_name ?? user.user_metadata?.name;
    const recipientName = typeof profile?.name === "string" && profile.name.trim()
      ? profile.name
      : typeof metadataName === "string" ? metadataName : "there";
    const transport = createEmailTransport();
    try {
      await transport.sendMail({
        from: { name: "ZeroIntern", address: process.env.GMAIL_USER! },
        to: user.email,
        messageId: `<${event.id}@zerointern.vercel.app>`,
        ...emailTemplate(event, recipientName),
      });
    } catch (sendError) {
      await finish(deliveryFailure(sendError, event.attempts));
      return NextResponse.json({ processed: 1 });
    } finally {
      transport.close();
    }
    // If this write fails, leave the lease intact for manual inspection. Do not
    // retry SMTP after Gmail has accepted a message.
    await finish({ status: "sent", sent_at: new Date().toISOString(), last_error: null });
    return NextResponse.json({ processed: 1 });
  } catch {
    return NextResponse.json({ error: "Notification processing failed" }, { status: 500 });
  }
}
