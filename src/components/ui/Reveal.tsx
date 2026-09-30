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
      <p className="mono-label mb-3">
        / {index} — {label}
      </p>
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-white/90 md:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
