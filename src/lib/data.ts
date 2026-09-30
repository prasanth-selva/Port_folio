import "server-only";
import {
  SEED_ACHIEVEMENTS,
  SEED_CERTIFICATIONS,
  SEED_EXPERIENCE,
  SEED_POSTS,
  SEED_PROJECTS,
  SEED_SETTINGS,
  SEED_SKILLS,
} from "@/lib/seed-data";
import { SUPABASE_MISSING_MSG, supabasePublic } from "@/lib/supabase";
import type {
  Achievement,
  Certification,
  Experience,
  Post,
  Project,
  Skill,
} from "@/lib/types";

/**
 * Public data layer. Reads from Supabase when configured; otherwise returns
 * the canonical seed content so the site is fully functional out of the box.
 * Unconfigured Supabase is expected in local dev — not an error path.
 */

async function withFallback<T>(
  table: string,
  seed: T[],
  order: string
): Promise<T[]> {
  const sb = supabasePublic();
  if (!sb) return seed;
  try {
    const { data, error } = await sb
      .from(table)
      .select("*")
      .eq("published", true)
      .order(order);
    if (error) throw error;
    // An empty configured table is an intentional empty state, not a reason
    // to resurrect seed rows that the admin may have deleted.
    return (data ?? []) as T[];
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[data] ${table}: falling back to seed (${(err as Error).message})`);
    }
    return seed;
  }
}

export async function getProjects(): Promise<Project[]> {
  return withFallback<Project>("projects", SEED_PROJECTS, "sort_order");
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getExperience(): Promise<Experience[]> {
  return withFallback<Experience>("experiences", SEED_EXPERIENCE, "sort_order");
}

export async function getCertifications(): Promise<Certification[]> {
  return withFallback<Certification>("certifications", SEED_CERTIFICATIONS, "sort_order");
}

export async function getAchievements(): Promise<Achievement[]> {
  return withFallback<Achievement>("achievements", SEED_ACHIEVEMENTS, "sort_order");
}

export async function getSkills(): Promise<Skill[]> {
  return withFallback<Skill>("skills", SEED_SKILLS, "sort_order");
}

export async function getPosts(): Promise<Post[]> {
  const posts = await withFallback<Post>("posts", SEED_POSTS, "published_at");
  return [...posts].sort(
    (a, b) =>
      new Date(b.published_at ?? b.created_at).getTime() -
      new Date(a.published_at ?? a.created_at).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export type SiteSettings = {
  heroBadge: string;
  resumeUrl: string | null;
  aboutPhoto: string | null;
  email: string;
  linkedin: string;
  github: string;
  phone: string | null;
  seoTitle: string;
  seoDescription: string;
};

const FALLBACK_SETTINGS: SiteSettings = {
  heroBadge: SEED_SETTINGS.heroBadge,
  resumeUrl: SEED_SETTINGS.resumeUrl,
  aboutPhoto: null,
  email: SEED_SETTINGS.email,
  linkedin: SEED_SETTINGS.linkedin,
  github: SEED_SETTINGS.github,
  phone: SEED_SETTINGS.phone ?? process.env.NEXT_PUBLIC_CONTACT_PHONE ?? null,
  seoTitle: SEED_SETTINGS.seoTitle,
  seoDescription: SEED_SETTINGS.seoDescription,
};

export async function getSettings(): Promise<SiteSettings> {
  const sb = supabasePublic();
  if (!sb) return FALLBACK_SETTINGS;
  try {
    const { data, error } = await sb.from("settings").select("*");
    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK_SETTINGS;
    const map = new Map((data as { key: string; value: unknown }[]).map((r) => [r.key, r.value]));
    const str = (k: string, d: string) => (typeof map.get(k) === "string" ? (map.get(k) as string) : d);
    const nstr = (k: string, d: string | null): string | null => {
      const v = map.get(k);
      return typeof v === "string" && v.length > 0 ? v : d;
    };
    return {
      heroBadge: str("heroBadge", FALLBACK_SETTINGS.heroBadge),
      resumeUrl: nstr("resumeUrl", FALLBACK_SETTINGS.resumeUrl),
      aboutPhoto: nstr("aboutPhoto", FALLBACK_SETTINGS.aboutPhoto),
      email: str("email", FALLBACK_SETTINGS.email),
      linkedin: nstr("linkedin", FALLBACK_SETTINGS.linkedin) ?? FALLBACK_SETTINGS.linkedin,
      github: nstr("github", FALLBACK_SETTINGS.github) ?? FALLBACK_SETTINGS.github,
      phone: nstr("phone", FALLBACK_SETTINGS.phone),
      seoTitle: str("seoTitle", FALLBACK_SETTINGS.seoTitle),
      seoDescription: str("seoDescription", FALLBACK_SETTINGS.seoDescription),
    };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[data] settings: falling back (${(err as Error).message})`);
    }
    return FALLBACK_SETTINGS;
  }
}

export { SUPABASE_MISSING_MSG };
