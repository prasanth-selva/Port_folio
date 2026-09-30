import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectBySlug, getProjects } from "@/lib/data";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.tagline ?? project.description.slice(0, 160),
    openGraph: {
      title: `${project.title} — Prasanth Selva`,
      description: project.tagline ?? project.description.slice(0, 160),
      images: project.cover_image ? [{ url: project.cover_image }] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const all = await getProjects();
  const others = all.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <main className="relative min-h-screen">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl px-6 pt-28 md:pt-36">
        <Link
          href="/#projects"
          className="font-mono text-xs tracking-[0.2em] text-white/40 transition-colors hover:text-accent-cyan"
        >
          ← BACK TO PROJECTS
        </Link>

        <header className="mt-8">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white/90 md:text-6xl">
            {project.title}
          </h1>
          {project.tagline && (
            <p className="mt-3 text-lg text-white/55 md:text-xl">{project.tagline}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent-cyan px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-glow transition-shadow hover:shadow-glow-sm"
              >
                Live Site <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 font-mono text-xs uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-accent-cyan/40 hover:text-white"
              >
                Source <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </header>

        {project.cover_image && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-white/8">
            <Image
              src={project.cover_image}
              alt={`${project.title} cover`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-12 grid gap-10 md:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="mono-label mb-4">/ BRIEFING</p>
            <p className="whitespace-pre-line leading-relaxed text-white/60 md:text-lg">
              {project.description}
            </p>

            {project.gallery.length > 0 && (
              <>
                <p className="mono-label mb-4 mt-12">/ GALLERY</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.gallery.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/8"
                    >
                      <Image
                        src={src}
                        alt={`${project.title} screenshot ${i + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 480px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside>
            <p className="mono-label mb-4">/ STACK</p>
            <ul className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-accent-cyan/20 bg-accent-cyan/[0.06] px-3 py-1 font-mono text-xs text-accent-cyan/90"
                >
                  {t}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {others.length > 0 && (
          <footer className="mt-20 border-t border-white/8 pb-24 pt-10">
            <p className="mono-label mb-6">/ NEXT MISSIONS</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {others.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="glass group rounded-2xl p-5 transition-colors hover:border-accent-cyan/30"
                >
                  <p className="font-semibold tracking-tight text-white/90 group-hover:text-accent-cyan">
                    {p.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-white/45">{p.tagline}</p>
                </Link>
              ))}
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
