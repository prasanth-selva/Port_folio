"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
  achievementSchema,
  certificationSchema,
  experienceSchema,
  postSchema,
  projectSchema,
  settingsSchema,
  skillSchema,
} from "@/lib/validation";

/**
 * All mutations run server-side with the service-role client and are guarded
 * by the NextAuth session. Zod validates every payload; on-demand ISR fires
 * on every save so public pages update instantly.
 *
 * Every action degrades gracefully: if Supabase env vars are missing, the UI
 * gets a clear actionable error instead of a 500.
 */

type ActionResult = { ok: true } | { ok: false; error: string };

const NOT_CONFIGURED =
  "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (README → Database setup).";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  return session;
}

async function withDb(fn: (sb: SupabaseClient) => Promise<ActionResult>): Promise<ActionResult> {
  await requireAdmin();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: NOT_CONFIGURED };
  }
  try {
    return await fn(supabaseAdmin());
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/projects", "layout");
  revalidatePath("/writeups", "layout");
}

// ---------------------------------------------------------------- uploads
export async function uploadMedia(
  formData: FormData
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdmin();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: NOT_CONFIGURED };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided" };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "File too large (max 8 MB)" };
  }

  let payload: Buffer = Buffer.from(await file.arrayBuffer());
  const isImage = file.type.startsWith("image/");
  let contentType = file.type;
  let ext = (file.name.split(".").pop() ?? "bin").toLowerCase();

  // Auto-compress raster images to WebP; PDFs and WebP pass through.
  if (isImage && file.type !== "image/webp") {
    try {
      const sharp = (await import("sharp")).default;
      payload = await sharp(payload).webp({ quality: 82 }).toBuffer();
      contentType = "image/webp";
      ext = "webp";
    } catch (err) {
      console.error("[upload] compression failed, storing original:", (err as Error).message);
    }
  }

  const safeBase =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60) || "file";
  const path = `${Date.now()}-${safeBase}.${ext}`;

  try {
    const sb = supabaseAdmin();
    const { error } = await sb.storage.from("media").upload(path, payload, {
      contentType,
      upsert: false,
    });
    if (error) return { ok: false, error: error.message };
    const { data } = sb.storage.from("media").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// --------------------------------------------------------------- projects
export async function saveProject(formData: FormData): Promise<ActionResult> {
  return withDb(async (sb) => {
    const parsed = projectSchema.safeParse({
      ...Object.fromEntries(formData),
      tech: String(formData.get("tech") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      gallery: String(formData.get("gallery") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }
    const { error } = await sb
      .from("projects")
      .upsert({ ...parsed.data, tagline: parsed.data.tagline || null }, { onConflict: "slug" });
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    revalidatePath(`/projects/${parsed.data.slug}`);
    return { ok: true };
  });
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return withDb(async (sb) => {
    const { error } = await sb.from("projects").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

// ------------------------------------------------------------- experiences
export async function saveExperience(formData: FormData): Promise<ActionResult> {
  return withDb(async (sb) => {
    const parsed = experienceSchema.safeParse({
      ...Object.fromEntries(formData),
      tech: String(formData.get("tech") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      current: formData.get("current") === "on",
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }
    const { error } = await sb.from("experiences").upsert({
      ...parsed.data,
      location: parsed.data.location || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  return withDb(async (sb) => {
    const { error } = await sb.from("experiences").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

// ---------------------------------------------------------- certifications
export async function saveCertification(formData: FormData): Promise<ActionResult> {
  return withDb(async (sb) => {
    const parsed = certificationSchema.safeParse({
      ...Object.fromEntries(formData),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }
    const { error } = await sb.from("certifications").upsert(parsed.data);
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  return withDb(async (sb) => {
    const { error } = await sb.from("certifications").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

// ------------------------------------------------------------ achievements
export async function saveAchievement(formData: FormData): Promise<ActionResult> {
  return withDb(async (sb) => {
    const parsed = achievementSchema.safeParse({
      ...Object.fromEntries(formData),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }
    const { error } = await sb.from("achievements").upsert({
      ...parsed.data,
      detail: parsed.data.detail || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

export async function deleteAchievement(id: string): Promise<ActionResult> {
  return withDb(async (sb) => {
    const { error } = await sb.from("achievements").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

// ------------------------------------------------------------------ skills
export async function saveSkill(formData: FormData): Promise<ActionResult> {
  return withDb(async (sb) => {
    const parsed = skillSchema.safeParse({
      ...Object.fromEntries(formData),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }
    const { error } = await sb.from("skills").upsert(parsed.data);
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  return withDb(async (sb) => {
    const { error } = await sb.from("skills").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

// Reorder helpers — direct-reference server actions (inline closures cannot
// cross the server/client boundary).
async function reorderIds(
  table: "projects" | "experiences" | "certifications" | "achievements" | "skills",
  ids: string[]
): Promise<ActionResult> {
  return withDb(async (sb) => {
    const updates = ids.map((id, i) => ({ id, sort_order: i + 1 }));
    const { error } = await sb.from(table).upsert(updates, { onConflict: "id" });
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  return reorderIds("projects", ids);
}
export async function reorderExperiences(ids: string[]): Promise<ActionResult> {
  return reorderIds("experiences", ids);
}
export async function reorderCertifications(ids: string[]): Promise<ActionResult> {
  return reorderIds("certifications", ids);
}
export async function reorderAchievements(ids: string[]): Promise<ActionResult> {
  return reorderIds("achievements", ids);
}
export async function reorderSkills(ids: string[]): Promise<ActionResult> {
  return reorderIds("skills", ids);
}

// ------------------------------------------------------------------- posts
export async function savePost(formData: FormData): Promise<ActionResult> {
  return withDb(async (sb) => {
    const parsed = postSchema.safeParse({
      ...Object.fromEntries(formData),
      tags: String(formData.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      published: formData.get("published") === "on",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }
    const { published_at, ...rest } = parsed.data;
    const { data: existing } = await sb
      .from("posts")
      .select("published_at")
      .eq("slug", parsed.data.slug)
      .single();
    const { error } = await sb.from("posts").upsert(
      {
        ...rest,
        excerpt: rest.excerpt || null,
        cover_image: rest.cover_image || null,
        published_at: published_at
          ? new Date(published_at).toISOString()
          : (existing?.published_at ?? new Date().toISOString()),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    revalidatePath(`/writeups/${parsed.data.slug}`);
    return { ok: true };
  });
}

export async function deletePost(id: string): Promise<ActionResult> {
  return withDb(async (sb) => {
    const { error } = await sb.from("posts").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    return { ok: true };
  });
}

// ---------------------------------------------------------------- settings
export async function saveSettings(formData: FormData): Promise<ActionResult> {
  return withDb(async (sb) => {
    const parsed = settingsSchema.safeParse({
      ...Object.fromEntries(formData),
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }
    const rows = Object.entries(parsed.data).map(([key, value]) => ({
      key,
      value: value as unknown,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await sb.from("settings").upsert(rows, { onConflict: "key" });
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
    revalidatePath("/admin/settings");
    return { ok: true };
  });
}

// ------------------------------------------------------------------- inbox
export async function markMessageRead(id: string, read: boolean): Promise<ActionResult> {
  return withDb(async (sb) => {
    const { error } = await sb.from("messages").update({ read }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/inbox");
    revalidatePath("/admin");
    return { ok: true };
  });
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return withDb(async (sb) => {
    const { error } = await sb.from("messages").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/inbox");
    revalidatePath("/admin");
    return { ok: true };
  });
}
