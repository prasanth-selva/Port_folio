"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { saveResumeUrl } from "@/lib/admin-actions";
import { uploadMediaFile } from "@/lib/media-upload-client";

export function ResumeUploader({ currentUrl }: { currentUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onPick = () => inputRef.current?.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = e.target.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await uploadMediaFile(file);
        setUrl(res.url);

        // Persist only the resume field; retain every unrelated setting.
        const saved = await saveResumeUrl(res.url);
        if (!saved.ok) setError(saved.error ?? "Uploaded, but saving settings failed");
        else router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed. Check your connection and try again.");
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white/90">Resume</h1>
      <p className="mt-1 font-mono text-xs text-white/40">
        Served from Supabase Storage. Max 8 MB, PDF only.
      </p>

      <div className="glass mt-6 rounded-2xl p-6">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onChange}
        />
        <button
          type="button"
          onClick={onPick}
          disabled={pending}
          className="rounded-xl bg-accent-cyan px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-black transition-shadow hover:shadow-glow-sm disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload PDF"}
        </button>

        {error && (
          <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-3 font-mono text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        {url && (
          <div className="mt-4">
            <p className="font-mono text-[11px] text-emerald-400/80">✓ CURRENT RESUME</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block break-all font-mono text-xs text-accent-cyan hover:underline"
            >
              {url}
            </a>
          </div>
        )}
        {!url && !error && (
          <p className="mt-4 font-mono text-xs text-white/30">
            No resume uploaded yet — the “Download Resume” buttons stay hidden until one exists.
          </p>
        )}
      </div>
    </div>
  );
}
