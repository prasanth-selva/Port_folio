"use client";

import { animate, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { getAboutContent, type StatItem } from "@/lib/about";

type Props = { photoUrl: string | null };

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: (v) => setDisplay(Number.isInteger(value) ? String(Math.round(v)) : v.toFixed(2)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export default function AboutSection({ photoUrl }: Props) {
  const content = getAboutContent();
  const photo = photoUrl ?? content.photo;

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHeading index="01" label="ABOUT" title={<>The operator behind the terminal.</>} />

      <div className="mt-12 grid gap-12 md:grid-cols-[280px_1fr] md:gap-16">
        <Reveal delay={0.1}>
          <div className="group relative">
            <div
              className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent-cyan/25 via-transparent to-accent-violet/25 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div className="glass relative aspect-[4/5] overflow-hidden rounded-2xl">
              {photo ? (
                <Image
                  src={photo}
                  alt="Portrait of Prasanth Selva"
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  className="object-cover"
                />
              ) : (
                /* Photo slot: stylized terminal portrait until an image is uploaded via /admin */
                <div className="flex h-full flex-col items-center justify-center gap-3 bg-black/40 font-mono text-white/30">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <path d="M32 8l18 7v14c0 11-7.6 18.4-18 22-10.4-3.6-18-11-18-22V15l18-7z" stroke="rgba(115,224,190,0.48)" strokeWidth="1.5" />
                    <circle cx="32" cy="27" r="6" stroke="rgba(115,224,190,0.48)" strokeWidth="1.5" />
                    <path d="M22 44c2.5-5 6.5-7 10-7s7.5 2 10 7" stroke="rgba(115,224,190,0.48)" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[10px] tracking-[0.3em]">PHOTO SLOT</span>
                  <span className="text-[10px] text-white/20">upload via /admin settings</span>
                </div>
              )}
            </div>
            <p className="mt-3 font-mono text-[11px] tracking-[0.2em] text-white/35">
              KGISL INSTITUTE OF TECHNOLOGY — COIMBATORE
            </p>
          </div>
        </Reveal>

        <div>
          {content.bio.map((para, i) => (
            <Reveal key={i} delay={0.15 + i * 0.08}>
              <p className="mb-5 leading-relaxed text-white/60 md:text-lg">{para}</p>
            </Reveal>
          ))}

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {content.stats.map((s: StatItem, i: number) => (
              <Reveal key={s.label} delay={0.2 + i * 0.07}>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-3xl font-semibold tracking-tight text-white/90 md:text-4xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
