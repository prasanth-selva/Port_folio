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
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={() => setFailed(true)}
          />
          <span className="absolute bottom-3 right-3 bg-black/65 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/75 opacity-0 transition-opacity group-hover:opacity-100">
            View scan ↗
          </span>
        </button>
      ) : (
        <div className="flex h-full flex-col justify-between p-4 font-mono text-white/40">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em]">
            <span>Evidence file</span>
            <span className="text-accent-cyan/80">{label}</span>
          </div>
          <div className="space-y-2">
            <div className="h-px w-3/4 bg-white/20" />
            <div className="h-px w-1/2 bg-white/10" />
            <div className="h-px w-2/3 bg-white/10" />
          </div>
          <p className="max-w-[18rem] text-[10px] leading-relaxed text-white/30">
            Scan pending — add the supplied web-ready image to <span className="text-accent-cyan/70">/public/certs</span>.
          </p>
        </div>
      )}
    </div>
  );
}
