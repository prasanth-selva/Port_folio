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
          ? "inline-flex items-center gap-2 rounded-md border border-[#2E3238] px-7 py-3 font-sans text-xs uppercase tracking-[0.2em] text-[#9CA3AF] transition-colors hover:border-white hover:text-white"
          : "metal-button inline-flex items-center gap-2 rounded-md px-7 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
      }
    >
      {children}
    </a>
  );
}
