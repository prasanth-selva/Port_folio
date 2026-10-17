import { NextResponse } from "next/server";

import { clientIp, distributedRateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32 * 1024;

type ReadResult =
  | { ok: true; payload: unknown }
  | { ok: false; reason: "too-large" | "invalid-json" };

async function readBoundedJson(req: Request): Promise<ReadResult> {
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { ok: false, reason: "too-large" };
  }

  const reader = req.body?.getReader();
  if (!reader) return { ok: false, reason: "invalid-json" };

  const chunks: Buffer[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return { ok: false, reason: "too-large" };
      }
      chunks.push(Buffer.from(value));
    }
    return { ok: true, payload: JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown };
  } catch {
    return { ok: false, reason: "invalid-json" };
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = await distributedRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const body = await readBoundedJson(req);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === "too-large" ? "Message is too large." : "Invalid JSON body." },
      { status: body.reason === "too-large" ? 413 : 400 }
    );
  }

  const parsed = contactSchema.safeParse(body.payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Validation failed" }, { status: 422 });
  }

  const { name, email, subject, message, company } = parsed.data;
  // Honeypot: silently accept and discard automated submissions.
  if (company) return NextResponse.json({ ok: true });

  const hasDatabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.CONTACT_NOTIFY_EMAIL;
  const hasEmail = Boolean(resendKey && notifyTo);
  if (!hasDatabase && !hasEmail) {
    return NextResponse.json(
      { error: "Contact delivery is temporarily unavailable. Please use the email link instead." },
      { status: 503 }
    );
  }

  let stored = false;
  if (hasDatabase) {
    try {
      const { error } = await supabaseAdmin().from("messages").insert({
        name,
        email,
        subject: subject || null,
        body: message,
      });
      if (error) {
        console.error("[contact] message storage failed:", error.code ?? "unknown");
      } else {
        stored = true;
      }
    } catch {
      console.error("[contact] message storage unavailable");
    }
  }

  let notified = false;
  if (hasEmail && resendKey && notifyTo) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>",
        to: notifyTo,
        replyTo: email,
        subject: `[Portfolio] ${(subject || "New message").replace(/[\r\n]+/g, " ")} — ${name.replace(/[\r\n]+/g, " ")}`,
        text: `${message}\n\n—\nFrom: ${name} <${email}>`,
      });
      if (error) throw new Error("Resend delivery failed");
      notified = true;
    } catch {
      console.error("[contact] email notification failed");
    }
  }

  if (!stored && !notified) {
    return NextResponse.json(
      { error: "Could not deliver your message. Please use the email link instead." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
