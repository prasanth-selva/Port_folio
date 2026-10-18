"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { Project } from "@/lib/types";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal delay={index * 0.06} className="min-w-0 shrink-0 basis-[calc(100vw-2.5rem)] snap-start sm:basis-[calc(100vw-4rem)] lg:basis-[calc(100vw-6rem)]">
      <article className="h-full border border-[#2E3238] bg-[#18191D]">
        <Link href={`/projects/${project.slug}`} className="group block">
          <div className="relative aspect-[16/9] overflow-hidden border-b border-[#2E3238] bg-[#202228]">
            {project.cover_image ? (
              <Image
                src={project.cover_image}
                alt={`${project.title} screenshot`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-end p-5">
                <span className="text-sm text-white/45">Screenshot not uploaded</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-metal">Project {String(index + 1).padStart(2, "0")}</p>
                <h3 className="text-xl font-semibold tracking-tight text-white/95 group-hover:text-accent-metal">{project.title}</h3>
              </div>
              <span className="text-lg text-accent-metal" aria-hidden="true">→</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">{project.tagline}</p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/45">
              <span>{project.tech.length} technologies</span>
              {project.live_url && <span>Live site</span>}
              {project.gallery.length > 0 && <span>{project.gallery.length} screenshots</span>}
            </div>
          </div>
        </Link>
      </article>
    </Reveal>
  );
}

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const publishedProjects = projects.filter((p) => p.published);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [railDistance, setRailDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const rail = railRef.current;
      if (rail) setRailDistance(Math.max(0, rail.scrollWidth - rail.clientWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (railRef.current) observer.observe(railRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [publishedProjects.length]);

  useEffect(() => {
    const syncRailToPage = () => {
      const scene = sceneRef.current;
      const rail = railRef.current;
      if (!scene || !rail || !railDistance) return;

      const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
      const progress = Math.max(0, Math.min(railDistance, window.scrollY - sceneTop));
      rail.scrollLeft = progress;
    };

    syncRailToPage();
    window.addEventListener("scroll", syncRailToPage, { passive: true });
    window.addEventListener("resize", syncRailToPage);
    return () => {
      window.removeEventListener("scroll", syncRailToPage);
      window.removeEventListener("resize", syncRailToPage);
    };
  }, [railDistance]);

  return (
    <div
      ref={sceneRef}
      className="relative"
      style={{ height: `calc(100vh + ${railDistance}px)` }}
    >
      <div className="sticky top-0 flex min-h-screen flex-col justify-center overflow-hidden py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading index="03" label="PROJECTS" title={<>Selected projects.</>} />
            <Reveal delay={0.15}>
              <p className="max-w-sm text-sm leading-6 text-white/60">
                Keep scrolling to move through the projects. Each card includes its stack, links, and available screenshots.
              </p>
            </Reveal>
          </div>
        </div>

        <div
          ref={railRef}
          className="project-rail relative left-1/2 mt-12 flex w-screen -translate-x-1/2 gap-5 overflow-hidden px-5 pb-5 sm:px-8 lg:px-12"
          aria-label="Projects — continue scrolling to move left to right"
        >
          {publishedProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
        </div>
        <p className="mt-1 px-6 text-center text-[10px] uppercase tracking-[0.16em] text-white/35">
          Scroll to move through projects
        </p>
      </div>
    </div>
  );
}
