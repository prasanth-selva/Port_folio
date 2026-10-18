"use client";

import { animate, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { getAboutContent, type StatItem } from "@/lib/about";

type Props = { photoUrl: string | null; stats: StatItem[] };

function Counter({ value, suffix }: { value: number | string; suffix: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    if (typeof value !== "number") {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Number.isInteger(value) ? String(Math.round(v)) : v.toFixed(2)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>;
}

export default function AboutSection({ photoUrl, stats }: Props) {
  const content = getAboutContent();
  const photo = photoUrl ?? content.photo;

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <SectionHeading index="01" label="ABOUT" title={<>About me.</>} />

      <div className="mt-12 grid gap-12 md:grid-cols-[240px_1fr] md:gap-16">
        <Reveal delay={0.1}>
          <div>
            <div className="relative aspect-[4/5] overflow-hidden border border-[#2E3238] bg-[#18191D]">
              {photo ? (
                <Image src={photo} alt="Portrait of Prasanth Selva" fill sizes="(max-width: 768px) 100vw, 240px" className="object-cover" />
              ) : (
                <div className="flex h-full items-end p-4 text-sm text-white/40">Photo not uploaded</div>
              )}
            </div>
            <p className="mt-3 text-xs leading-5 text-white/40">KGISL Institute of Technology, Coimbatore</p>
          </div>
        </Reveal>

        <div>
          {content.bio.map((para, i) => (
            <Reveal key={i} delay={0.15 + i * 0.08}>
              <p className="mb-5 max-w-3xl text-base leading-7 text-white/65 md:text-lg">{para}</p>
            </Reveal>
          ))}

          <div className="mt-10 grid grid-cols-2 gap-px border border-[#2E3238] bg-[#2E3238] sm:grid-cols-4">
            {stats.map((stat: StatItem, i: number) => (
              <Reveal key={stat.label} delay={0.2 + i * 0.07}>
                <div className="bg-[#18191D] p-5">
                  <p className="text-3xl font-semibold tracking-tight text-white/95 md:text-4xl"><Counter value={stat.value} suffix={stat.suffix} /></p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/45">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
