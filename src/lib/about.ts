import { SEED_ABOUT } from "@/lib/seed-data";

export type StatItem = { label: string; value: number | string; suffix: string };

export type AboutContent = {
  bio: string[];
  photo: string | null;
  stats: StatItem[];
};

/**
 * About content lives in the `settings` table under the `about` key so the
 * admin can edit the bio paragraphs and stat tiles from /admin/settings.
 * When Supabase is unconfigured (or the row is missing), the canonical seed
 * copy renders so the site is never blank.
 */
export function aboutFromSetting(value: unknown): AboutContent {
  const fallback = {
    bio: SEED_ABOUT.bio,
    photo: SEED_ABOUT.photo,
    stats: SEED_ABOUT.stats,
  };
  if (!value || typeof value !== "object") return fallback;

  const raw = value as {
    bio?: unknown;
    photo?: unknown;
    stats?: unknown;
  };

  const bio = Array.isArray(raw.bio)
    ? raw.bio.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    : fallback.bio;

  const photo =
    typeof raw.photo === "string" && raw.photo.trim().length > 0 ? raw.photo.trim() : null;

  const stats = Array.isArray(raw.stats)
    ? raw.stats
        .map((s): StatItem | null => {
          if (!s || typeof s !== "object") return null;
          const stat = s as { label?: unknown; value?: unknown; suffix?: unknown };
          if (typeof stat.label !== "string" || !stat.label.trim()) return null;
          const val = stat.value;
          if (typeof val !== "number" && typeof val !== "string") return null;
          return {
            label: stat.label.trim(),
            value: typeof val === "number" && !Number.isFinite(val) ? 0 : val,
            suffix: typeof stat.suffix === "string" ? stat.suffix : "",
          };
        })
        .filter((s): s is StatItem => s !== null)
    : fallback.stats;

  return { bio, photo, stats };
}
