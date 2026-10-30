import type { Metadata } from "next";
import Link from "next/link";

import { getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Writeups",
  description:
    "Notes and writeups on what Manisha Nithya is learning and building.",
};

export default async function WriteupsPage() {
  const posts = await getPosts();
  const tags = [...new Set(posts.flatMap((p) => p.tags))];

  return (
    <main className="relative min-h-screen">
      <div className="relative mx-auto max-w-4xl px-6 pt-28 md:pt-36">
        <p className="mono-label mb-3">FIELD NOTES</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-white/90 md:text-6xl">
          Writeups.
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-[#9CA3AF] md:text-lg">
          CTF notes, application-security notes, and practical lessons from projects.
        </p>

        {tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="All tags">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-md border border-white/10 px-3 py-1 font-sans text-[10px] uppercase tracking-[0.15em] text-white/45"
              >
                #{t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 space-y-4 pb-24">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/writeups/${post.slug}`}
              className="surface group block rounded-md p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-metal/30"
            >
              <div className="flex flex-wrap items-center gap-3 font-sans text-[11px] tracking-[0.15em] text-white/35">
                <span>{formatDate(post.published_at ?? post.created_at)}</span>
                <span aria-hidden="true">·</span>
                <span>{post.reading_minutes} MIN READ</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-white/90 transition-colors group-hover:text-accent-metal">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{post.excerpt}</p>
              )}
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-accent-metal/15 bg-accent-metal/[0.05] px-2.5 py-0.5 font-sans text-[10px] text-accent-metal/80"
                  >
                    #{t}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="rounded-md border border-dashed border-white/10 p-12 text-center font-sans text-xs text-white/30">
              No writeups published yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
