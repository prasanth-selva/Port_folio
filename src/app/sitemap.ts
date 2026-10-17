import type { MetadataRoute } from "next";

import { getPosts, getProjects } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);

  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/writeups`, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${base}/writeups/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
