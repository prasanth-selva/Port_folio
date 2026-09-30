-- ============================================================================
-- Prasanth Selva portfolio — initial schema
-- Run in Supabase SQL editor (or `supabase db push`).
-- Public: read published rows. Admin: full write (service role bypasses RLS).
-- ============================================================================

-- ---------------------------------------------------------------- projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  description text not null,
  tech text[] not null default '{}',
  cover_image text,
  gallery text[] not null default '{}',
  live_url text,
  github_url text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------- experiences
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  org text not null,
  location text,
  start_date text not null,
  end_date text,
  current boolean not null default false,
  description text not null,
  tech text[] not null default '{}',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------- certifications
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issued_on text not null,
  credential_url text,
  image text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------ achievements
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text,
  occurred_on text,
  image text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ skills
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  level integer not null default 70 check (level between 1 and 100),
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------- posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  tags text[] not null default '{}',
  cover_image text,
  reading_minutes integer not null default 4,
  published boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- settings
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ indexes
create index if not exists projects_published_idx on public.projects (published, sort_order);
create index if not exists experiences_published_idx on public.experiences (published, sort_order);
create index if not exists certifications_published_idx on public.certifications (published, sort_order);
create index if not exists achievements_published_idx on public.achievements (published, sort_order);
create index if not exists skills_published_idx on public.skills (published, sort_order);
create index if not exists posts_published_idx on public.posts (published, published_at desc);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- --------------------------------------------------------------------- RLS
alter table public.projects enable row level security;
alter table public.experiences enable row level security;
alter table public.certifications enable row level security;
alter table public.achievements enable row level security;
alter table public.skills enable row level security;
alter table public.posts enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;

-- Public read on published content
create policy "public read published projects"
  on public.projects for select using (published = true);
create policy "public read published experiences"
  on public.experiences for select using (published = true);
create policy "public read published certifications"
  on public.certifications for select using (published = true);
create policy "public read published achievements"
  on public.achievements for select using (published = true);
create policy "public read published skills"
  on public.skills for select using (published = true);
create policy "public read published posts"
  on public.posts for select using (published = true);

-- Messages: insert by anyone (contact form), no public read/update/delete
create policy "public can submit messages"
  on public.messages for insert with check (true);

-- Settings: public read
create policy "public read settings"
  on public.settings for select using (true);

-- Admin writes: authenticated role only (NextAuth session is app-level;
-- the admin UI mutates via the service-role server actions, which bypass RLS).
-- These policies exist so a future Supabase-Auth admin can write directly.
create policy "admin write projects"
  on public.projects for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "admin write experiences"
  on public.experiences for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "admin write certifications"
  on public.certifications for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "admin write achievements"
  on public.achievements for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "admin write skills"
  on public.skills for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "admin write posts"
  on public.posts for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "admin manage messages"
  on public.messages for update using (auth.role() = 'authenticated');
create policy "admin delete messages"
  on public.messages for delete using (auth.role() = 'authenticated');
create policy "admin write settings"
  on public.settings for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ----------------------------------------------------------------- storage
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media"
  on storage.objects for select using (bucket_id = 'media');

create policy "admin upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "admin update media"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "admin delete media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');
