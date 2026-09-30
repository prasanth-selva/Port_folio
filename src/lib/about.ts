import { SEED_ABOUT } from "@/lib/seed-data";

export type StatItem = { label: string; value: number; suffix: string };

export type AboutContent = {
  bio: string[];
  photo: string | null;
  stats: StatItem[];
};

/**
 * About content is stored as a `settings` row (`about` key) when the admin
 * edits it; otherwise the canonical seed copy renders.
 */
export function getAboutContent(): AboutContent {
  return {
    bio: SEED_ABOUT.bio,
    photo: SEED_ABOUT.photo,
    stats: SEED_ABOUT.stats,
  };
}
