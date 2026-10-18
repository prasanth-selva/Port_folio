-- Portfolio proof metadata: descriptive copy and structured result labels.
-- Safe to re-run in an existing Supabase project.

alter table public.certifications
  add column if not exists description text;

alter table public.achievements
  add column if not exists placement text;

alter table public.achievements
  add column if not exists organizer text;

alter table public.skills
  add column if not exists description text;
