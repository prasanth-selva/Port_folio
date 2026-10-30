import type {
  Achievement,
  Certification,
  Experience,
  Post,
  Project,
  Skill,
} from "@/lib/types";

export const SEED_SETTINGS = {
  heroBadge: "B.E. CSE & Cybersecurity — Class of 2029",
  resumeUrl: null as string | null,
  email: "manishanithya7@gmail.com",
  linkedin: "https://linkedin.com/in/manisha-nithya",
  github: "https://github.com/manisha-nithya",
  phone: null as string | null,
  seoTitle: "Manisha Nithya — B.E. CSE & Cybersecurity Student",
  seoDescription:
    "Portfolio of Manisha Nithya, B.E. CSE & Cybersecurity student graduating in 2029. Building secure systems, exploring web security, and learning in public.",
};

export const SEED_ABOUT = {
  bio: [
    "I'm Manisha Nithya, a B.E. Computer Science & Engineering (Cybersecurity) student graduating in 2029. I'm passionate about understanding how systems work under the hood and how to secure them from the ground up — from web applications to network protocols.",
    "My focus spans computer science fundamentals, secure coding practices, and practical software engineering. I believe in learning by building real projects, participating in capture-the-flag (CTF) challenges, and writing about what I discover along the way.",
    "This portfolio is my dynamic workspace and record. Every section is fully editable through the admin panel as my skills and projects grow.",
  ],
  photo: null as string | null,
  stats: [
    { label: "Degree", value: "B.E. CSE", suffix: "" },
    { label: "Specialization", value: "Cybersecurity", suffix: "" },
    { label: "Class of", value: 2029, suffix: "" },
    { label: "Projects", value: 0, suffix: "" },
  ],
};

export const SEED_PROJECTS: Project[] = [];
export const SEED_EXPERIENCE: Experience[] = [];
export const SEED_SKILLS: Skill[] = [
  { id: "seed-cyber-1", name: "Cybersecurity Fundamentals", category: "Security", level: 80, sort_order: 1, published: true, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "seed-cyber-2", name: "Web Security", category: "Security", level: 75, sort_order: 2, published: true, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "seed-cyber-3", name: "Python", category: "Languages", level: 80, sort_order: 3, published: true, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "seed-cyber-4", name: "Linux", category: "Systems", level: 78, sort_order: 4, published: true, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "seed-cyber-5", name: "Data Structures", category: "Core", level: 75, sort_order: 5, published: true, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "seed-cyber-6", name: "Next.js & React", category: "Build", level: 70, sort_order: 6, published: true, created_at: "2026-01-01T00:00:00.000Z" },
];
export const SEED_CERTIFICATIONS: Certification[] = [];
export const SEED_ACHIEVEMENTS: Achievement[] = [];
export const SEED_POSTS: Post[] = [];
