"use client";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { Certification } from "@/lib/types";

export default function CertificationsSection({ items }: { items: Certification[] }) {

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHeading index="06" label="CERTIFICATIONS" title={<>Credentials on record.</>} />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.06}>
            <article className="glass group relative h-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-cyan/30 hover:shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.06] text-accent-cyan"
                  aria-hidden="true"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="9" r="5.5" />
                    <path d="M8.8 13.5 7 21l5-2.4L17 21l-1.8-7.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/35">{c.issued_on}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug tracking-tight text-white/90">
                {c.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-white/45">{c.issuer}</p>
              {c.credential_url && (
                <a
                  href={c.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.15em] text-accent-cyan transition-colors hover:text-white"
                >
                  VERIFY CREDENTIAL <span aria-hidden="true">↗</span>
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
