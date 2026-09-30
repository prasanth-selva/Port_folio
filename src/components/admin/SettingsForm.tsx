"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { saveSettings, uploadMedia } from "@/lib/admin-actions";

type Settings = {
  heroBadge: string;
  resumeUrl: string | null;
  email: string;
  linkedin: string;
  github: string;
  phone: string | null;
  seoTitle: string;
  seoDescription: string;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();
  const photoRef = useRef<HTMLInputElement | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const onSubmit = (fd: FormData) => {
    startTransition(async () => {
      setError(null);
      setOk(false);
      const res = await saveSettings(fd);
      if (!res.ok) {
        setError(res.error ?? "Save failed");
        return;
      }
      setOk(true);
      router.refresh();
    });
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadMedia(fd);
    setPhotoUploading(false);
    if (!res.ok || !res.url) {
      setError(res.error ?? "Upload failed");
      return;
    }
    setPhotoUrl(res.url);
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 outline-none transition-colors focus:border-accent-cyan/50";

  return (
    <form action={onSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Site settings</h1>
        <p className="mt-1 font-mono text-xs text-white/40">
          PUBLIC IDENTITY, SOCIALS, SEO DEFAULTS, RESUME
        </p>
      </div>

      <div className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mono-label mb-2 block" htmlFor="heroBadge">Hero badge</label>
          <input id="heroBadge" name="heroBadge" defaultValue={settings.heroBadge} className={inputCls} />
        </div>
        <div>
          <label className="mono-label mb-2 block" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={settings.email} className={inputCls} />
        </div>
        <div>
          <label className="mono-label mb-2 block" htmlFor="phone">Phone (optional, hidden if blank)</label>
          <input id="phone" name="phone" defaultValue={settings.phone ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="mono-label mb-2 block" htmlFor="linkedin">LinkedIn URL</label>
          <input id="linkedin" name="linkedin" defaultValue={settings.linkedin} className={inputCls} />
        </div>
        <div>
          <label className="mono-label mb-2 block" htmlFor="github">GitHub URL</label>
          <input id="github" name="github" defaultValue={settings.github} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="mono-label mb-2 block" htmlFor="resumeUrl">Resume URL (or upload on the Resume page)</label>
          <input id="resumeUrl" name="resumeUrl" defaultValue={settings.resumeUrl ?? ""} className={`${inputCls} font-mono text-xs`} />
        </div>
      </div>

      <div className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="mono-label mb-3">SEO DEFAULTS</p>
        </div>
        <div className="sm:col-span-2">
          <label className="mono-label mb-2 block" htmlFor="seoTitle">Title</label>
          <input id="seoTitle" name="seoTitle" defaultValue={settings.seoTitle} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="mono-label mb-2 block" htmlFor="seoDescription">Description</label>
          <textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={settings.seoDescription} className={`${inputCls} resize-none`} />
        </div>
      </div>

      <div className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="mono-label mb-3">ABOUT PHOTO</p>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhotoChange}
          />
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            disabled={photoUploading}
            className="rounded-xl border border-white/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-white/70 transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan disabled:opacity-50"
          >
            {photoUploading ? "Uploading…" : "Upload photo (auto-webp)"}
          </button>
          {photoUrl && (
            <p className="mt-3 break-all font-mono text-xs text-accent-cyan">
              {photoUrl} — paste this into the photo field of the About section or use it as any cover image.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-3 font-mono text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-3 font-mono text-xs text-emerald-300" role="status">
          ✓ Settings saved — public pages revalidated.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent-cyan px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-black transition-shadow hover:shadow-glow-sm disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
