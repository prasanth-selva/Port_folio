import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { getPostBySlug, getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Writeup not found" };
  return {
    title: post.title,
    description: post.excerpt ?? post.content.slice(0, 160),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.published_at ?? undefined,
      tags: post.tags,
    },
  };
}

export default async function WriteupPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  // Markdown -> sanitized HTML server-side.
  // remarkRehype drops raw HTML (allowDangerousHtml defaults to false),
  // so even admin-authored content cannot inject markup here.
  const body = post.content.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify)
    .process(body);
  const html = String(file);

  return (
    <main className="relative min-h-screen">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <article className="relative mx-auto max-w-3xl px-6 pb-24 pt-28 md:pt-36">
        <Link
          href="/writeups"
          className="font-mono text-xs tracking-[0.2em] text-white/40 transition-colors hover:text-accent-cyan"
        >
          ← ALL WRITEUPS
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.15em] text-white/35">
            <span>{formatDate(post.published_at ?? post.created_at)}</span>
            <span aria-hidden="true">·</span>
            <span>{post.reading_minutes} MIN READ</span>
          </div>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white/90 md:text-5xl">
            {post.title}
          </h1>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-accent-cyan/20 bg-accent-cyan/[0.06] px-2.5 py-0.5 font-mono text-[10px] text-accent-cyan/90"
              >
                #{t}
              </li>
            ))}
          </ul>
        </header>

        <div className="mdx mt-10" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
}
