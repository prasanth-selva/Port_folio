"use client";

import type { ReactNode } from "react";

import { useMagnetic } from "@/components/ui/MagneticButton";

export function MagneticLink({
  href,
  children,
  external = false,
  muted = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  muted?: boolean;
}) {
  const ref = useMagnetic<HTMLAnchorElement>();
  return (
    <a
      ref={ref}
      href={href}
      {...(external && href.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={
        muted
          ? "inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
          : "inline-flex items-center gap-2 rounded-full bg-accent-cyan px-7 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-glow transition-shadow hover:shadow-glow-sm"
      }
    >
      {children}
    </a>
  );
}
