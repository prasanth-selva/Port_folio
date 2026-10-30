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
  /** Display name, e.g. "Manisha Nithya" — derived from site settings. */
  name?: string;
};

/**
 * Scroll-synced text overlays with short, readable copy.
 */
export function HeroOverlay({ scrollYProgress, badge, resumeUrl, name = "Manisha Nithya" }: Props) {
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
          className="border-b-2 border-accent-metal px-1 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-metal"
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
        <span className="font-sans text-[10px] tracking-[0.35em] text-white/35">SCROLL</span>
        <span className="block h-8 w-px bg-accent-metal" />
      </motion.div>

      {/* 0% — intro, centered */}
      <motion.div
        style={{ opacity: introOpacity, y: introY }}
        className="absolute inset-0 flex items-center justify-center px-6 text-center"
      >
        <div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white/90 md:text-7xl">
            {name}.
          </h1>
          <p className="mt-4 text-lg text-white/60 md:text-2xl">
            Securing systems, building robust software.
          </p>
        </div>
      </motion.div>

      {/* 30% — SOC, left aligned */}
      <motion.div
        style={{ opacity: socOpacity, y: socY }}
        className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-24"
      >
        <div className="max-w-md">
          <p className="mono-label mb-3">01 — SECURITY</p>
          <p className="text-3xl font-semibold leading-tight tracking-tight text-white/90 md:text-5xl">
            Cybersecurity &amp; systems.
            <br />
            <span className="text-[#9CA3AF]">Web security and robust defense.</span>
          </p>
        </div>
      </motion.div>

      {/* 60% — stack, right aligned */}
      <motion.div
        style={{ opacity: stackOpacity, y: stackY }}
        className="absolute inset-0 flex items-center justify-end px-6 text-right md:px-16 lg:px-24"
      >
        <div className="max-w-md">
          <p className="mono-label mb-3">02 — PRECISION</p>
          <p className="text-3xl font-semibold leading-tight tracking-tight text-white/90 md:text-5xl">
            Python. Linux.
            <br />
            <span className="text-[#9CA3AF]">Next.js &amp; secure engineering.</span>
          </p>
        </div>
      </motion.div>

      {/* 90% — outro + CTAs, centered */}
      <motion.div
        style={{ opacity: outroOpacity, y: outroY }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="mono-label mb-4">03 — INNOVATION</p>
        <p className="text-3xl font-semibold tracking-tight text-white/90 md:text-5xl">
          Ready to build securely?
        </p>
        <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-4">
          <MagneticLink href="#projects">See projects</MagneticLink>
          {resumeUrl ? (
            <MagneticLink href={resumeUrl} external>
              Download resume
            </MagneticLink>
          ) : (
            <MagneticLink href="#contact" muted>
              Contact me
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
