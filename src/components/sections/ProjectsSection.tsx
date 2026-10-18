import Image from "next/image";
import Link from "next/link";

import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import type { Project } from "@/lib/types";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal delay={index * 0.06} className="min-w-0 shrink-0 basis-[88%] snap-start sm:basis-[70%] md:basis-[48%] lg:basis-[34%]">
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
        className="project-rail mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-5"
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
