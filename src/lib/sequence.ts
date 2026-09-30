/** Shared sequence manifest helpers (safe on client and server). */

export type SequenceManifest = {
  prefix: string;
  suffix: string;
  count: number;
  pad: number;
};

export const FALLBACK_MANIFEST: SequenceManifest = {
  prefix: "/sequence/core_",
  suffix: "_delay-0.04s.webp",
  count: 300,
  pad: 3,
};

export function frameUrl(m: SequenceManifest, index0: number): string {
  const n = Math.min(Math.max(index0 + 1, 1), m.count);
  return `${m.prefix}${String(n).padStart(m.pad, "0")}${m.suffix}`;
}

export function frameUrls(m: SequenceManifest): string[] {
  return Array.from({ length: m.count }, (_, i) => frameUrl(m, i));
}
