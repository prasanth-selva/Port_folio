"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProofMedia({
  src,
  alt,
  label,
  compact = false,
  onOpen,
}: {
  src: string | null;
  alt: string;
  label: string;
  compact?: boolean;
  onOpen?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const visible = Boolean(src) && !failed;

  return (
    <div
      className={`certificate-paper relative overflow-hidden border border-white/10 bg-black/20 ${
        compact ? "aspect-[16/10]" : "aspect-[4/3]"
      }`}
    >
      {visible ? (
        <button
          type="button"
          className="group absolute inset-0 block h-full w-full cursor-zoom-in text-left"
          onClick={onOpen}
          aria-label={`Open ${alt}`}
        >
          <Image
            src={src as string}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
            onError={() => setFailed(true)}
          />
          <span className="absolute bottom-3 right-3 bg-black/65 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/75 opacity-0 transition-opacity group-hover:opacity-100">
            View scan ↗
          </span>
        </button>
      ) : (
        <div className="flex h-full flex-col justify-end p-4 text-white/45">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-amber">{label}</p>
          <p className="mt-2 max-w-[18rem] text-sm leading-5">Evidence image not uploaded.</p>
        </div>
      )}
    </div>
  );
}
