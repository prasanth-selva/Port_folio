"use client";

import {
  motion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { ReactNode } from "react";

import { MagneticLink } from "@/components/ui/MagneticLink";

type Props = {
  scrollYProgress: MotionValue<number>;
  badge: string;
  resumeUrl: string | null;
};

/**
 * Scroll-synced text overlays with gentle fade + translate windows:
 *   0.00–0.22 intro (centered) · 0.26–0.46 SOC (left)
 *   0.54–0.74 stack (right)    · 0.84–1.00 outro + CTAs (centered)
 */
export function HeroOverlay({ scrollYProgress, badge, resumeUrl }: Props) {
  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.02, 0.16, 0.22],
    [1, 1, 0, 0],
    { clamp: true }
  );
  const introY = useShift(scrollYProgress, 0, 0.22, 8);

  const socOpacity = useOpacity(scrollYProgress, 0.26, 0.31, 0.42, 0.47);
  const socY = useShift(scrollYProgress, 0.26, 0.47, 14);

  const stackOpacity = useOpacity(scrollYProgress, 0.54, 0.59, 0.7, 0.75);
  const stackY = useShift(scrollYProgress, 0.54, 0.75, 14);

  const outroOpacity = useOpacity(scrollYProgress, 0.84, 0.89, 1.01, 1.02);
  const outroY = useShift(scrollYProgress, 0.84, 1.0, 12);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Badge — always visible, top center */}
      <div className="absolute inset-x-0 top-20 flex justify-center md:top-24">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="glass rounded-full px-4 py-1.5 font-mono text-[11px] tracking-[0.25em] text-accent-cyan"
        >
          {badge}
        </motion.span>
      </div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: introOpacity }}
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] tracking-[0.35em] text-white/35">SCROLL</span>
        <span className="block h-8 w-px bg-gradient-to-b from-accent-cyan/70 to-transparent" />
      </motion.div>

      {/* 0% — intro, centered */}
      <motion.div
        style={{ opacity: introOpacity, y: introY }}
        className="absolute inset-0 flex items-center justify-center px-6 text-center"
      >
        <div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white/90 md:text-7xl">
            Prasanth Selva.
          </h1>
          <p className="mt-4 text-lg text-white/60 md:text-2xl">
            I break things to <span className="text-accent-cyan">secure</span> them.
          </p>
        </div>
      </motion.div>

      {/* 30% — SOC, left aligned */}
      <motion.div
        style={{ opacity: socOpacity, y: socY }}
        className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-24"
      >
        <div className="max-w-md">
          <p className="mono-label mb-3">/ 01 — WHAT I DO</p>
          <p className="text-3xl font-semibold leading-tight tracking-tight text-white/90 md:text-5xl">
            SOC operations.
            <br />
            <span className="text-white/50">AI-driven threat monitoring.</span>
          </p>
        </div>
      </motion.div>

      {/* 60% — stack, right aligned */}
      <motion.div
        style={{ opacity: stackOpacity, y: stackY }}
        className="absolute inset-0 flex items-center justify-end px-6 text-right md:px-16 lg:px-24"
      >
        <div className="max-w-md">
          <p className="mono-label mb-3">/ 02 — THE STACK</p>
          <p className="text-3xl font-semibold leading-tight tracking-tight text-white/90 md:text-5xl">
            Linux. Python. SIEM.
            <br />
            IDS/IPS. <span className="text-white/50">Web security.</span>
          </p>
        </div>
      </motion.div>

      {/* 90% — outro + CTAs, centered */}
      <motion.div
        style={{ opacity: outroOpacity, y: outroY }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="mono-label mb-4">/ 03 — NEXT</p>
        <p className="text-3xl font-semibold tracking-tight text-white/90 md:text-5xl">
          Let&apos;s build secure systems.
        </p>
        <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-4">
          <MagneticLink href="#projects">View Projects</MagneticLink>
          {resumeUrl ? (
            <MagneticLink href={resumeUrl} external>
              Download Resume
            </MagneticLink>
          ) : (
            <MagneticLink href="#contact" muted>
              Get in Touch
            </MagneticLink>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function useOpacity(
  p: MotionValue<number>,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number
): MotionValue<number> {
  return useTransform(p, [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd], [0, 1, 1, 0], {
    clamp: true,
  });
}

function useShift(
  p: MotionValue<number>,
  from: number,
  to: number,
  amount: number
): MotionValue<string> {
  return useTransform(p, [from, to], [`${amount}px`, `-${amount}px`], { clamp: true });
}

export type { ReactNode };
