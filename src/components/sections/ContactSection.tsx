"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { SiteSettings } from "@/lib/data";
import { contactSchema, type ContactInput } from "@/lib/validation";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactSection({ settings }: { settings: SiteSettings }) {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", company: "" },
  });

  const onSubmit = async (values: ContactInput) => {
    setStatus("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to send message");
      }
      setStatus("sent");
      reset();
    } catch (err) {
      setStatus("error");
      setServerError((err as Error).message);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 placeholder:text-white/25 outline-none transition-colors focus:border-accent-cyan/50 focus:bg-white/[0.05]";
  const errCls = "mt-1.5 font-mono text-[11px] text-red-400/90";

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHeading index="07" label="CONTACT" title={<>Open a secure channel.</>} />

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <Reveal>
          <div className="space-y-4">
            <p className="leading-relaxed text-white/55 md:text-lg">
              Recruiting for a security team? Building something that needs to
              be unbreakable? Or just found a bug on this site (respect) — my
              inbox is monitored like a SOC queue.
            </p>

            <ul className="space-y-3 pt-4 font-mono text-sm">
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="group flex items-center gap-3 text-white/60 transition-colors hover:text-accent-cyan"
                >
                  <span className="text-accent-cyan/60">→</span> {settings.email}
                </a>
              </li>
              <li>
                <a
                  href={settings.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-white/60 transition-colors hover:text-accent-cyan"
                >
                  <span className="text-accent-cyan/60">→</span> linkedin/in/prasanth-selva
                </a>
              </li>
              <li>
                <a
                  href={settings.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-white/60 transition-colors hover:text-accent-cyan"
                >
                  <span className="text-accent-cyan/60">→</span> github/prasanth-selva
                </a>
              </li>
            </ul>

            {settings.resumeUrl && (
              <a
                href={settings.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-cyan px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-glow transition-shadow hover:shadow-glow-sm"
              >
                Download Resume <span aria-hidden="true">↓</span>
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-6 md:p-8" noValidate>
            {/* Honeypot — hidden from humans, catnip for bots */}
            <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
              <label>
                Company
                <input type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mono-label mb-2 block">Name</label>
                <input id="name" type="text" placeholder="Ada Lovelace" className={inputCls} {...register("name")} />
                {errors.name && <p className={errCls}>{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="mono-label mb-2 block">Email</label>
                <input id="email" type="email" placeholder="you@domain.com" className={inputCls} {...register("email")} />
                {errors.email && <p className={errCls}>{errors.email.message}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="subject" className="mono-label mb-2 block">Subject</label>
              <input id="subject" type="text" placeholder="Security role / CTF collab / bug report" className={inputCls} {...register("subject")} />
              {errors.subject && <p className={errCls}>{errors.subject.message}</p>}
            </div>

            <div className="mt-4">
              <label htmlFor="message" className="mono-label mb-2 block">Message</label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell me what you're building (or breaking)…"
                className={`${inputCls} resize-none`}
                {...register("message")}
              />
              {errors.message && <p className={errCls}>{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-cyan px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "sending" ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  TRANSMITTING…
                </>
              ) : (
                "TRANSMIT →"
              )}
            </button>

            {status === "sent" && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.06] px-4 py-3 font-mono text-xs text-accent-cyan"
                role="status"
              >
                ✓ Message received. Expect a reply within 24–48h.
              </motion.p>
            )}
            {status === "error" && (
              <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-3 font-mono text-xs text-red-400" role="alert">
                ✗ {serverError ?? "Transmission failed. Try email instead."}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </div>
  );
}
