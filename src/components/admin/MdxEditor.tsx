"use client";

import { debounce } from "es-toolkit";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

type Post = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  tags: string[];
  cover_image: string | null;
  reading_minutes: number;
  published: boolean;
};

export function MdxEditor({ post, saveAction, deleteAction }: {
  post?: Post;
  saveAction: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
  deleteAction?: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [content, setContent] = useState(post?.content ?? "");
  const [preview, setPreview] = useState<{ html: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPreview, setShowPreview] = useState(false);
  const previewKey = useRef(0);

  const requestPreview = useRef(
    debounce(async (mdx: string) => {
      try {
        const res = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mdx }),
        });
        if (res.ok) {
          const data = (await res.json()) as { html: string[] };
          previewKey.current += 1;
          setPreview(data);
        }
      } catch {
        // Preview is best-effort.
      }
    }, 600)
  ).current;

  const onContentChange = (v: string) => {
    setContent(v);
    void requestPreview(v);
  };

  const onSubmit = (fd: FormData) => {
    startTransition(async () => {
      const res = await saveAction(fd);
      if (!res.ok) {
        setError(res.error ?? "Save failed");
        return;
      }
      router.refresh();
      router.push("/admin/writeups");
    });
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 outline-none transition-colors focus:border-accent-cyan/50";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">
          {post ? "Edit writeup" : "New writeup"}
        </h1>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="rounded-xl border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/60 transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan"
        >
          {showPreview ? "Hide preview" : "Live preview"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-3 font-mono text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <form action={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        {post?.id && <input type="hidden" name="id" value={post.id} />}

        <div>
          <label className="mono-label mb-2 block" htmlFor="w-title">Title</label>
          <input id="w-title" name="title" defaultValue={post?.title ?? ""} required className={inputCls} />
        </div>
        <div>
          <label className="mono-label mb-2 block" htmlFor="w-slug">Slug</label>
          <input id="w-slug" name="slug" defaultValue={post?.slug ?? ""} required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={`${inputCls} font-mono`} />
        </div>
        <div className="md:col-span-2">
          <label className="mono-label mb-2 block" htmlFor="w-excerpt">Excerpt</label>
          <input id="w-excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} className={inputCls} />
        </div>

        <div className="md:col-span-2">
          <label className="mono-label mb-2 block" htmlFor="w-content">
            Content (Markdown + MDX-free syntax)
          </label>
          <textarea
            id="w-content"
            name="content"
            required
            rows={20}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className={`${inputCls} font-mono text-[13px] leading-relaxed`}
            spellCheck={false}
          />
        </div>

        {showPreview && (
          <div className="md:col-span-2">
            <p className="mono-label mb-2">LIVE PREVIEW</p>
            <div className="mdx glass max-h-[60vh] overflow-y-auto rounded-2xl p-6">
              {preview ? (
                preview.html.map((html, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
                ))
              ) : (
                <p className="font-mono text-xs text-white/30">Type to render preview…</p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="mono-label mb-2 block" htmlFor="w-tags">Tags (comma-separated)</label>
          <input id="w-tags" name="tags" defaultValue={post?.tags.join(", ") ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mono-label mb-2 block" htmlFor="w-reading">Reading minutes</label>
          <input id="w-reading" name="reading_minutes" type="number" min={1} max={120} defaultValue={post?.reading_minutes ?? 4} className={inputCls} />
        </div>
        <div>
          <label className="mono-label mb-2 block" htmlFor="w-cover">Cover image URL</label>
          <input id="w-cover" name="cover_image" defaultValue={post?.cover_image ?? ""} className={inputCls} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 font-mono text-xs text-white/60">
            <input type="checkbox" name="published" defaultChecked={post?.published ?? true} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#00F0FF]" />
            Published
          </label>
        </div>

        <div className="md:col-span-2 flex items-center justify-between">
          {post?.id && deleteAction ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this writeup permanently?")) {
                  startTransition(async () => {
                    await deleteAction?.(post.id!);
                    router.push("/admin/writeups");
                    router.refresh();
                  });
                }
              }}
              className="rounded-xl border border-white/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-white/50 transition-colors hover:border-red-400/40 hover:text-red-400"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-accent-cyan px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-black transition-shadow hover:shadow-glow-sm disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save writeup"}
          </button>
        </div>
      </form>
    </div>
  );
}
