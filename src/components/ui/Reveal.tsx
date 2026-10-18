"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  index,
  label,
  title,
  className = "",
}: {
  index: string;
  label: string;
  title: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <div className="flex items-start gap-4">
        <span className="font-mono text-xs tracking-[0.2em] text-accent-cyan/80">{index}</span>
        <div className="min-w-0 flex-1">
          <p className="mono-label mb-3">{label}</p>
          <div className="editorial-rule mb-5 max-w-2xl" aria-hidden="true" />
          <h2 className="display-title text-balance text-4xl leading-[0.96] text-white/95 md:text-6xl">
            {title}
          </h2>
        </div>
      </div>
    </Reveal>
  );
}
