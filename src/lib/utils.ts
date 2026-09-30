import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

export function pad3(n: number) {
  return n.toString().padStart(3, "0");
}

/** Rough reading time for MDX content in minutes. */
export function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Clamp a number into [min, max]. */
export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
