"use client";

import Image from "next/image";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { useAchievementsData } from "@/components/sections/usePublicData";

export default function AchievementsSection() {
  const items = useAchievementsData();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHeading index="05" label="ACHIEVEMENTS & CTFS" title={<>Proof of work.</>} />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {items.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.08}>
            <article className="glass group relative h-full overflow-hidden rounded-2xl p-6 transition-colors hover:border-accent-cyan/30">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-cyan/10 blur-2xl transition-opacity duration-500 group-hover:bg-accent-cyan/20"
                aria-hidden="true"
              />
              {a.image && (
                <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border border-white/5">
                  <Image src={a.image} alt="" fill sizes="320px" className="object-cover" />
                </div>
              )}
              <p className="font-mono text-[10px] tracking-[0.25em] text-accent-cyan/70">
                {a.occurred_on ?? "UNDATED"}
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-white/90">
                {a.title}
              </h3>
              {a.detail && <p className="mt-3 text-sm leading-relaxed text-white/50">{a.detail}</p>}
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
