import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  /** Honeypot — must stay empty; bots fill it. */
  company: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactSchema>;

const urlish = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .max(500)
  .or(z.literal(""))
  .transform((v) => (v === "" ? null : v));

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only")
    .min(2)
    .max(120),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(10).max(8000),
  tech: z.array(z.string().trim().min(1).max(40)).max(24).default([]),
  cover_image: urlish,
  gallery: z.array(urlish).max(12).default([]),
  live_url: urlish,
  github_url: urlish,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const experienceSchema = z.object({
  role: z.string().trim().min(2).max(140),
  org: z.string().trim().min(2).max(140),
  location: z.string().trim().max(140).optional().or(z.literal("")),
  start_date: z.string().trim().min(4).max(20),
  end_date: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  current: z.boolean().default(false),
  description: z.string().trim().min(10).max(8000),
  tech: z.array(z.string().trim().min(1).max(40)).max(24).default([]),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const certificationSchema = z.object({
  title: z.string().trim().min(2).max(200),
  issuer: z.string().trim().min(2).max(140),
  issued_on: z.string().trim().min(4).max(20),
  credential_url: urlish,
  image: urlish,
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});
export type CertificationInput = z.infer<typeof certificationSchema>;

export const achievementSchema = z.object({
  title: z.string().trim().min(2).max(200),
  detail: z.string().trim().max(2000).optional().or(z.literal("")),
  occurred_on: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  image: urlish,
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});
export type AchievementInput = z.infer<typeof achievementSchema>;

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.string().trim().min(2).max(60),
  level: z.coerce.number().int().min(1).max(100),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});
export type SkillInput = z.infer<typeof skillSchema>;

export const postSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only")
    .min(2)
    .max(140),
  excerpt: z.string().trim().max(400).optional().or(z.literal("")),
  content: z.string().trim().min(20),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
  cover_image: urlish,
  reading_minutes: z.coerce.number().int().min(1).max(120).default(4),
  published: z.boolean().default(true),
  published_at: z.string().trim().optional().or(z.literal("")),
});
export type PostInput = z.infer<typeof postSchema>;

export const settingsSchema = z.object({
  heroBadge: z.string().trim().max(80).default(""),
  resumeUrl: urlish,
  email: z.string().trim().email(),
  linkedin: urlish,
  github: urlish,
  phone: urlish,
  seoTitle: z.string().trim().max(120).default(""),
  seoDescription: z.string().trim().max(300).default(""),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const messageUpdateSchema = z.object({
  id: z.string().uuid(),
  read: z.boolean().optional(),
});
