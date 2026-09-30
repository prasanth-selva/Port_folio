"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { SEED_PROJECTS } from "@/lib/seed-data";
import type { Project } from "@/lib/types";

function TiltCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const reduce = useReducedMotionSafe();

  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 220, damping: 22 });
  const glowX = useTransform(mx, [0, 1], ["20%", "80%"]);
  const glowY = useTransform(my, [0, 1], ["20%", "80%"]);
  const glowBg = useMotionTemplate`radial-gradient(420px circle at ${glowX} ${glowY}, rgba(0,240,255,0.09), transparent 65%)`;

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduce || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    },
    [mx, my, reduce]
  );

  const onLeave = useCallback(() => {
    mx.set(0.5);
    my.set(0.5);
  }, [mx, my]);

  return (
    <Reveal delay={index * 0.08}>
      <motion.div style={{ perspective: 1000 }}>
        <motion.div style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}>
          <Link
            ref={ref}
            href={`/projects/${project.slug}`}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="group glass relative block overflow-hidden rounded-2xl transition-colors duration-300 hover:border-accent-cyan/30"
            aria-label={`${project.title} — view details`}
          >
            <motion.div style={{ background: glowBg }} className="pointer-events-none absolute inset-0" aria-hidden="true" />

            <div className="relative aspect-[16/10] overflow-hidden border-b border-white/5 bg-black/40">
              {project.cover_image ? (
                <Image
                  src={project.cover_image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full flex-col justify-between p-6 font-mono">
                  <span className="text-[10px] tracking-[0.3em] text-accent-cyan/60">
                    {String(index + 1).padStart(2, "0")} / MISSION
                  </span>
                  <div className="grid grid-cols-8 gap-1 opacity-30" aria-hidden="true">
                    {Array.from({ length: 32 }, (_, i) => (
                      <span
                        key={i}
                        className="aspect-square rounded-[2px]"
                        style={{
                          background: (i * 7 + index * 3) % 5 === 0 ? "rgba(0,240,255,0.5)" : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-white/90">{project.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{project.tagline}</p>
                </div>
                <span className="mt-1 font-mono text-xs text-accent-cyan opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  →
                </span>
              </div>

              {/* Tech stack — hover reveal on desktop, always visible on touch */}
              <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100 [@media(hover:none)]:max-h-40 [@media(hover:none)]:opacity-100">
                <ul className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-accent-cyan/20 bg-accent-cyan/[0.06] px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-accent-cyan/90"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </Reveal>
  );
}

function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return reduced;
}

export default function ProjectsSection() {
  const projects = SEED_PROJECTS.filter((p) => p.published);
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading index="03" label="PROJECTS" title={<>Deployed missions.</>} />
        <Reveal delay={0.15}>
          <p className="max-w-sm text-sm leading-relaxed text-white/45">
            Security tooling, AI platforms and production web — each one shipped,
            each one battle-tested.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {projects.map((p, i) => (
          <TiltCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </div>
  );
}
