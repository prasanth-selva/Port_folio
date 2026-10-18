"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { Project } from "@/lib/types";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal delay={index * 0.06} className="min-w-0 shrink-0 basis-[calc(100vw-2.5rem)] snap-start sm:basis-[70vw] md:basis-[56vw] lg:basis-[42vw] xl:basis-[36vw]">
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
  const railRef = useRef<HTMLDivElement | null>(null);

  const handleRailWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const nextScroll = Math.max(0, Math.min(maxScroll, rail.scrollLeft + delta));
    const canScrollHorizontally = nextScroll !== rail.scrollLeft;

    // Keep normal page scrolling at either end of the rail, but turn the
    // wheel into horizontal movement while there are cards left to browse.
    if (canScrollHorizontally) {
      event.preventDefault();
      rail.scrollLeft = nextScroll;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading index="03" label="PROJECTS" title={<>Selected projects.</>} />
        <Reveal delay={0.15}>
          <p className="max-w-sm text-sm leading-6 text-white/60">
            Working products and security tools. Open a project to see its stack, links, and available screenshots.
          </p>
        </Reveal>
      </div>

      <div
        ref={railRef}
        onWheel={handleRailWheel}
        className="project-rail relative left-1/2 mt-12 flex w-screen -translate-x-1/2 snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-5 pb-5 touch-pan-x sm:px-8 lg:px-12"
        aria-label="Projects — scroll left to right"
      >
        {publishedProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
      </div>
      <p className="mt-1 text-right text-[10px] uppercase tracking-[0.16em] text-white/35 sm:hidden">
        Swipe left and right to browse
      </p>
    </div>
  );
}
