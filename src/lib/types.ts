export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  tech: string[];
  cover_image: string | null;
  gallery: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type Experience = {
  id: string;
  role: string;
  org: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
  tech: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  issued_on: string;
  credential_url: string | null;
  image: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Achievement = {
  id: string;
  title: string;
  detail: string | null;
  occurred_on: string | null;
  image: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  tags: string[];
  cover_image: string | null;
  reading_minutes: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  read: boolean;
  created_at: string;
};

export type Settings = {
  key: string;
  value: unknown;
  updated_at: string;
};
