"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import ProofMedia from "@/components/ui/ProofMedia";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { Achievement } from "@/lib/types";

function resultLabel(item: Achievement) {
  if (item.placement) return item.placement;
  const match = item.title.match(/(Rank\s+#?\d+|Top\s+\d+[^—–-]*|Finalist|\d+(?:st|nd|rd|th)\s+of\s+\d+)/i);
  return match?.[1] ?? "FIELD NOTE";
}

export default function AchievementsSection({ items }: { items: Achievement[] }) {
  const [selected, setSelected] = useState<Achievement | null>(null);
  const visibleItems = items.filter((item) => item.published !== false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-8 md:grid-cols-[1fr_260px] md:items-end">
        <SectionHeading index="05" label="ACHIEVEMENTS & CTFS" title={<>Results and events.</>} />
        <Reveal delay={0.12}>
          <p className="border-l border-accent-metal/50 pl-4 text-sm leading-relaxed text-[#9CA3AF]">
            Competition results, community work, and other documented outcomes.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.06} className={i === 0 ? "lg:col-span-2" : ""}>
            <article className="editorial-card group h-full overflow-hidden">
              <div className="relative">
                <ProofMedia
                  src={item.image}
                  alt={`${item.title} achievement evidence`}
                  label={`PROOF ${String(i + 1).padStart(2, "0")}`}
                  compact
                  onOpen={() => item.image && setSelected(item)}
                />
                <span className="absolute left-3 top-3 border border-accent-metal/45 bg-[#17131a]/85 px-2 py-1 font-sans text-[9px] uppercase tracking-[0.16em] text-accent-metal">
                  {resultLabel(item)}
                </span>
              </div>
              <div className="relative p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-accent-metal/80">{item.occurred_on ?? "UNDATED"}</p>
                  <span className="font-sans text-[10px] text-white/25">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-xl font-medium leading-tight tracking-tight text-white/95">{item.title}</h3>
                {item.organizer && <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.14em] text-white/35">{item.organizer}</p>}
                {item.detail && <p className="mt-4 text-sm leading-relaxed text-white/52">{item.detail}</p>}
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {selected?.image && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-[#050505]/90 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.title} evidence image`}
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
                alt={`${selected.title} evidence image`}
                width={1800}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="max-h-[78vh] w-full object-contain"
              />
              <div className="flex items-center justify-between gap-4 px-2 pb-1 pt-3">
                <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">{selected.title}</p>
                <button type="button" onClick={() => setSelected(null)} className="font-sans text-[10px] uppercase tracking-[0.16em] text-accent-metal hover:text-white">
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
