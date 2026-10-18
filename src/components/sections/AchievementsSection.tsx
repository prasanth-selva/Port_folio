"use client";

import ProofMedia from "@/components/ui/ProofMedia";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { Achievement } from "@/lib/types";

function resultLabel(item: Achievement) {
  if (item.placement) return item.placement;
  const match = item.title.match(/(Rank\s+#?\d+|Top\s+\d+[^—–-]*|Finalist|\d+(?:st|nd|rd|th)\s+of\s+\d+)/i);
  return match?.[1] ?? "FIELD NOTE";
}

export default function AchievementsSection({ items }: { items: Achievement[] }) {
  const visibleItems = items.filter((item) => item.published !== false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-8 md:grid-cols-[1fr_260px] md:items-end">
        <SectionHeading index="05" label="ACHIEVEMENTS & CTFS" title={<>Proof of work.</>} />
        <Reveal delay={0.12}>
          <p className="border-l border-accent-coral/50 pl-4 text-sm leading-relaxed text-white/50">
            Competition results, community leadership, and the moments where theory had to survive a clock.
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
                />
                <span className="absolute left-3 top-3 border border-accent-coral/45 bg-[#17131a]/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-accent-coral">
                  {resultLabel(item)}
                </span>
              </div>
              <div className="relative p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan/80">{item.occurred_on ?? "UNDATED"}</p>
                  <span className="font-mono text-[10px] text-white/25">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-xl font-medium leading-tight tracking-tight text-white/95">{item.title}</h3>
                {item.organizer && <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">{item.organizer}</p>}
                {item.detail && <p className="mt-4 text-sm leading-relaxed text-white/52">{item.detail}</p>}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
