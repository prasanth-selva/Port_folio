"use client";

import { SEED_ACHIEVEMENTS, SEED_CERTIFICATIONS, SEED_EXPERIENCE } from "@/lib/seed-data";
import type { Achievement, Certification, Experience } from "@/lib/types";

/**
 * Sections are server-rendered with seed/DB content where possible. These
 * hooks give client components immediate seed data (first paint), while the
 * home page passes fresh data via props when available.
 */

export function useExperienceData(): Experience[] {
  return SEED_EXPERIENCE;
}

export function useCertificationsData(): Certification[] {
  return SEED_CERTIFICATIONS;
}

export function useAchievementsData(): Achievement[] {
  return SEED_ACHIEVEMENTS;
}
