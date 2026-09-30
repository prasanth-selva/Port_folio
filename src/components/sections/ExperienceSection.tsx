"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { useExperienceData } from "@/components/sections/usePublicData";
import type { Experience } from "@/lib/types";

function TimelineItem({ item, index }: { item: Experience; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.45"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [24, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, x }} className="relative pl-10 md:pl-0">
      <div className="md:grid md:grid-cols-[1fr_24px_1.4fr] md:gap-8">
        {/* Period (left column, right-aligned on desktop; swaps sides on odd rows) */}
        <div
          className={`mb-2 md:mb-0 md:pt-1 ${
            index % 2 === 0 ? "md:order-1 md:text-right" : "md:order-3 md:text-left"
          }`}
        >
          <p className="font-mono text-xs tracking-[0.18em] text-accent-cyan/90">
            {item.start_date} — {item.current ? "PRESENT" : item.end_date}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
            {item.location ?? "—"}
          </p>
        </div>

        {/* Node */}
        <div className="absolute left-[7px] top-1.5 md:relative md:left-0 md:order-2 md:flex md:justify-center">
          <span className="relative block h-3 w-3">
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-base bg-accent-cyan" />
          </span>
        </div>

        {/* Card */}
        <div className={index % 2 === 0 ? "md:order-3" : "md:order-1"}>
          <div className="glass rounded-2xl p-6 transition-colors hover:border-accent-cyan/25">
            <h3 className="text-lg font-semibold tracking-tight text-white/90">{item.role}</h3>
            <p className="mt-0.5 font-mono text-xs text-accent-cyan/80">{item.org}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/55">{item.description}</p>
            {item.tech.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
                {item.tech.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-white/50"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperienceSection() {
  const items = useExperienceData();
  const lineRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 0.75", "end 0.6"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHeading index="02" label="EXPERIENCE" title={<>Field log.</>} />

      <div ref={lineRef} className="relative mt-14">
        {/* Rail */}
        <div className="absolute bottom-0 left-[13px] top-0 w-px bg-white/8 md:left-1/2" aria-hidden="true" />
        <motion.div
          style={{ scaleY }}
          className="absolute bottom-0 left-[13px] top-0 w-px origin-top bg-gradient-to-b from-accent-cyan via-accent-cyan/60 to-accent-violet/70 md:left-1/2"
          aria-hidden="true"
        />

        <div className="space-y-12">
          {items.map((item, i) => (
            <TimelineItem key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
