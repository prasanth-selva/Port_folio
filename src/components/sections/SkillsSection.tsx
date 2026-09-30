"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { SectionHeading } from "@/components/ui/Reveal";
import type { Skill } from "@/lib/types";

// R3F orbit — client-only, mounted only when in view on capable devices.
const SkillOrbit3D = dynamic(() => import("@/components/three/SkillOrbit"), {
  ssr: false,
});

function SkillOrbit2D({ skills }: { skills: Skill[] }) {
  return (
    <div className="glass relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-full border border-white/8">
      <div className="absolute inset-[18%] rounded-full border border-white/5" aria-hidden="true" />
      <div className="absolute inset-[34%] rounded-full border border-white/5" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="font-mono text-[10px] tracking-[0.35em] text-accent-cyan/70">CORE</p>
        <p className="mt-1 font-mono text-[10px] text-white/30">11 modules</p>
      </div>
      {skills.map((s, i) => {
        const angle = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
        const ring = i % 3;
        const radiusPct = ring === 0 ? 50 : ring === 1 ? 41 : 32;
        const x = 50 + Math.cos(angle) * radiusPct;
        const y = 50 + Math.sin(angle) * radiusPct;
        return (
          <div
            key={s.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="glass flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[10px] text-white/70 shadow-glow-sm transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan">
              <span className="h-1 w-1 rounded-full bg-accent-cyan" />
              {s.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const webgl = (() => {
      try {
        const c = document.createElement("canvas");
        return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
      } catch {
        return false;
      }
    })();
    setUse3D(fine && webgl && !reduced);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32" id="skills">
      <SectionHeading index="04" label="SKILLS" title={<>The stack, in orbit.</>} />

      <div ref={containerRef} className="mt-14 grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="min-h-[420px]">
          {use3D && inView ? (
            <SkillOrbit3D skills={skills} />
          ) : (
            <SkillOrbit2D skills={skills} />
          )}
        </div>

        <div>
          <p className="leading-relaxed text-white/55 md:text-lg">
            Depth where it matters: Linux internals and Python tooling on the
            core layer, SIEM/IDS-IPS for detection engineering, and an offense
            toolkit that keeps defenses honest.
          </p>
          <ul className="mt-8 space-y-3">
            {["Core", "Defense", "Offense", "Build"].map((cat) => (
              <li key={cat} className="flex items-center gap-4">
                <span className="w-20 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {cat}
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <span
                        key={s.id}
                        className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[10px] text-white/55"
                      >
                        {s.name}
                      </span>
                    ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
