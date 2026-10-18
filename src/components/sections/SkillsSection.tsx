"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";

import { SectionHeading } from "@/components/ui/Reveal";
import type { Skill } from "@/lib/types";

const SkillOrbit3D = dynamic(() => import("@/components/three/SkillOrbit"), { ssr: false });

class OrbitBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.warn("[skills] 3D orbit failed, using 2D fallback:", error); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function SkillOrbit2D({ skills }: { skills: Skill[] }) {
  const safeSkills = skills.slice(0, 16);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-visible rounded-full border border-accent-cyan/15 bg-[radial-gradient(circle_at_center,rgba(227,174,98,0.13),rgba(18,23,33,0.72)_42%,rgba(12,16,24,0.96)_70%)]">
      <div className="absolute inset-[13%] rounded-full border border-white/8" aria-hidden="true" />
      <div className="absolute inset-[27%] rounded-full border border-white/8" aria-hidden="true" />
      <div className="absolute inset-[41%] rounded-full border border-accent-cyan/15" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="font-mono text-[10px] tracking-[0.35em] text-accent-cyan/85">CAPABILITY MAP</p>
        <p className="mt-2 font-mono text-[10px] text-white/35">{skills.length} modules / 04 domains</p>
      </div>
      {safeSkills.map((skill, i) => {
        const angle = (i / Math.max(safeSkills.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const radiusPct = i % 3 === 0 ? 45 : i % 3 === 1 ? 35 : 25;
        const x = 50 + Math.cos(angle) * radiusPct;
        const y = 50 + Math.sin(angle) * radiusPct;
        return (
          <div key={skill.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <div className="glass flex max-w-[132px] items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-[10px] leading-tight text-white/75 shadow-glow-sm transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan">
              <span className="h-1 w-1 shrink-0 rounded-full bg-accent-cyan" />
              <span>{skill.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const DOMAIN_COPY: Record<string, string> = {
  Core: "The everyday instruments: systems, scripting, and the Linux mindset behind reliable analysis.",
  Defense: "Detection and response work: turning noisy telemetry into a useful incident signal.",
  Offense: "Adversarial thinking: finding the path an attacker would take before it becomes an incident.",
  Build: "Shipping layer: secure products, APIs, and AI workflows that hold up outside a demo.",
};

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch { /* use the 2D map */ }
    setUse3D(fine && webgl && !reduced);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const categories = Array.from(new Set(["Core", "Defense", "Offense", "Build", ...skills.map((skill) => skill.category)]));

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32" id="skills">
      <div className="grid gap-8 md:grid-cols-[1fr_260px] md:items-end">
        <SectionHeading index="04" label="SKILLS" title={<>The stack, with intent.</>} />
        <p className="border-l border-accent-cyan/40 pl-4 text-sm leading-relaxed text-white/50">
          Tools are only useful when they map to a way of thinking. This is the working set behind the projects and field notes.
        </p>
      </div>

      <div ref={containerRef} className="mt-14 grid items-center gap-14 md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative px-3 py-8 sm:px-10 md:px-0">
          {use3D && inView ? (
            <OrbitBoundary fallback={<SkillOrbit2D skills={skills} />}><SkillOrbit3D skills={skills} /></OrbitBoundary>
          ) : (
            <SkillOrbit2D skills={skills} />
          )}
        </div>

        <div className="space-y-6">
          {categories.map((category) => {
            const entries = skills.filter((skill) => skill.category === category);
            if (!entries.length) return null;
            return (
              <div key={category} className="border-t border-white/10 pt-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent-cyan">{category}</h3>
                  <span className="font-mono text-[10px] text-white/25">{String(entries.length).padStart(2, "0")} tools</span>
                </div>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/45">{DOMAIN_COPY[category] ?? "A focused part of the working toolkit."}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {entries.map((skill) => (
                    <li key={skill.id} className="rounded-sm border border-white/10 bg-white/[0.025] px-2.5 py-1.5 font-mono text-[10px] text-white/65">
                      {skill.name} <span className="ml-1 text-accent-cyan/70">{skill.level}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
