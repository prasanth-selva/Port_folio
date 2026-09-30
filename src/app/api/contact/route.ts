import { NextResponse } from "next/server";

import { clientIp, rateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Rate limit: 5 messages per IP per 10 minutes.
  const ip = clientIp(req.headers);
  const rl = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many messages. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Validation failed" },
      { status: 422 }
    );
  }

  const { name, email, subject, message, company } = parsed.data;

  // Honeypot: silently accept but drop.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  // Persist to DB when Supabase is configured; otherwise log-and-accept so
  // the form never hard-fails on unconfigured environments.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const sb = supabaseAdmin();
    const { error } = await sb.from("messages").insert({
      name,
      email,
      subject: subject || null,
      body: message,
    });
    if (error) {
      console.error("[contact] insert failed:", error.message);
      return NextResponse.json(
        { error: "Could not store your message. Please email directly." },
        { status: 500 }
      );
    }
  } else {
    console.warn("[contact] Supabase not configured; message not persisted:", {
      name,
      email,
    });
  }

  // Optional email notification via Resend.
  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.CONTACT_NOTIFY_EMAIL;
  if (resendKey && notifyTo) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>",
        to: notifyTo,
        replyTo: email,
        subject: `[Portfolio] ${subject || "New message"} — ${name}`,
        text: `${message}\n\n—\nFrom: ${name} <${email}>`,
      });
    } catch (err) {
      console.error("[contact] resend failed:", (err as Error).message);
      // Non-fatal: the message is already stored.
    }
  }

  return NextResponse.json({ ok: true });
}
