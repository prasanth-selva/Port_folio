"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import ProofMedia from "@/components/ui/ProofMedia";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { Certification } from "@/lib/types";

export default function CertificationsSection({ items }: { items: Certification[] }) {
  const [selected, setSelected] = useState<Certification | null>(null);
  const visibleItems = items.filter((item) => item.published !== false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-8 md:grid-cols-[1fr_260px] md:items-end">
        <SectionHeading index="06" label="CERTIFICATIONS" title={<>Certificates.</>} />
        <Reveal delay={0.12}>
          <p className="border-l border-accent-amber/40 pl-4 text-sm leading-relaxed text-white/50">
            Course certificates and training records. Open a scan when one is available.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {visibleItems.map((cert, i) => (
          <Reveal key={cert.id} delay={i * 0.06}>
            <article className="editorial-card group grid gap-0 overflow-hidden md:grid-cols-[minmax(180px,0.85fr)_1.15fr]">
              <ProofMedia
                src={cert.image}
                alt={`${cert.title} certificate scan`}
                label={`CERT ${String(i + 1).padStart(2, "0")}`}
                compact
                onOpen={() => cert.image && setSelected(cert)}
              />
              <div className="relative flex flex-col p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-amber/80">{cert.issued_on}</span>
                  <span className="font-mono text-[10px] text-white/25">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 text-xl font-medium leading-tight tracking-tight text-white/95">{cert.title}</h3>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.13em] text-white/42">{cert.issuer}</p>
                <p className="mt-4 text-sm leading-relaxed text-white/52">
                  {cert.description ?? "Credential documenting focused security training and practical study."}
                </p>
                <div className="mt-auto pt-6">
                  {cert.credential_url ? (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border-b border-accent-amber/45 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-amber transition-colors hover:border-accent-amber hover:text-white"
                    >
                      Verify credential <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/28">Archive entry</span>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {selected && selected.image && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-[#07090e]/90 p-5 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.title} certificate scan`}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden border border-white/15 bg-[#111620] p-2 shadow-2xl"
              initial={{ y: 18, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={selected.image}
                alt={`${selected.title} certificate scan`}
                width={1800}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="max-h-[78vh] w-full object-contain"
              />
              <div className="flex items-center justify-between gap-4 px-2 pb-1 pt-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">{selected.title}</p>
                <button type="button" onClick={() => setSelected(null)} className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-amber hover:text-white">
                  Close ×
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
