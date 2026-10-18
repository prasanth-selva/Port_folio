"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deletePost } from "@/lib/admin-actions";

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
};

export default function WriteupsList({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <ul className="space-y-2">
      {posts.map((p) => (
        <li key={p.id} className="surface flex items-center justify-between gap-4 rounded-md px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-white/85">{p.title}</p>
            <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.18em]">
              {p.published ? (
                <span className="text-emerald-400/80">● published</span>
              ) : (
                <span className="text-[#D4D6DB]">● draft</span>
              )}{" "}
              <span className="text-white/30">/writeups/{p.slug}</span>
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => router.push(`/admin/writeups/${p.id}`)}
              className="rounded-md border border-white/10 px-3 py-1.5 font-sans text-[11px] text-white/60 transition-colors hover:border-accent-metal/40 hover:text-accent-metal"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (window.confirm("Delete this writeup permanently?")) {
                  startTransition(async () => {
                    await deletePost(p.id);
                    router.refresh();
                  });
                }
              }}
              className="rounded-md border border-white/10 px-3 py-1.5 font-sans text-[11px] text-white/60 transition-colors hover:border-red-400/40 hover:text-red-400 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
      {posts.length === 0 && (
        <li className="rounded-md border border-dashed border-white/10 px-4 py-10 text-center font-sans text-xs text-white/30">
          No writeups yet.
        </li>
      )}
    </ul>
  );
}
