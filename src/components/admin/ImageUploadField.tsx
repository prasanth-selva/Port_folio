"use client";

import { useRef, useState } from "react";

import { uploadMedia } from "@/lib/admin-actions";

type Props = {
  name: string;
  label: string;
  defaultValue: string;
  multiple?: boolean;
};

export function ImageUploadField({ name, label, defaultValue, multiple = false }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setError("");
    setStatus("");
    const uploaded: string[] = [];
    let uploadError = "";

    try {
      for (const [index, file] of files.entries()) {
        setStatus(`Uploading ${index + 1} of ${files.length}…`);
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadMedia(formData);
        if (!result.ok || !result.url) {
          uploadError = result.error ?? `Could not upload ${file.name}`;
          break;
        }
        uploaded.push(result.url);
      }
    } catch {
      uploadError = "Upload failed. Check your connection and try again.";
    } finally {
      setBusy(false);
    }

    if (uploaded.length > 0) {
      setValue((current) => {
        const existing = multiple
          ? current.split(",").map((url) => url.trim()).filter(Boolean)
          : [];
        return [...existing, ...uploaded].join(", ");
      });
    }

    if (uploadError) {
      setError(uploadError);
      setStatus(uploaded.length > 0 ? `${uploaded.length} image(s) uploaded; save the form to keep them.` : "");
      return;
    }
    setStatus(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded. Save the form to keep the URL${uploaded.length === 1 ? "" : "s"}.`);
  };

  return (
    <div>
      <label className="mono-label mb-2 block" htmlFor={`f-${name}`}>
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`f-${name}`}
          name={name}
          type={multiple ? "text" : "url"}
          inputMode={multiple ? undefined : "url"}
          autoCapitalize="none"
          autoCorrect="off"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={multiple ? "Paste image URLs, separated by commas" : "Paste an image URL or upload a file"}
          className="w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 outline-none transition-colors focus:border-accent-cyan/50"
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="shrink-0 rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.06] px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-cyan transition-colors hover:bg-accent-cyan/[0.12] disabled:cursor-wait disabled:opacity-50"
        >
          {busy ? "Uploading…" : multiple ? "Upload images" : "Upload image"}
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Choose ${multiple ? "images" : "an image"} for ${label}`}
        onChange={handleFiles}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
        <span className="text-white/35">PNG, JPG, WebP, AVIF or GIF · Max 8 MB each</span>
        {status && <span className="text-accent-cyan" role="status">{status}</span>}
        {error && <span className="text-red-400" role="alert">{error}</span>}
      </div>
    </div>
  );
}
