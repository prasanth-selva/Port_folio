"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

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
  resumeUrlSchema,
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
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!session || !adminEmail || session.user?.email?.trim().toLowerCase() !== adminEmail) {
    redirect("/admin/login");
  }
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

type ContentTable = "projects" | "experiences" | "certifications" | "achievements" | "skills" | "posts";

async function saveContentRow(
  sb: SupabaseClient,
  table: ContentTable,
  formData: FormData,
  payload: Record<string, unknown>
): Promise<ActionResult> {
  const rawId = String(formData.get("id") ?? "").trim();
  const parsedId = rawId ? z.string().uuid().safeParse(rawId) : null;
  if (parsedId && !parsedId.success) return { ok: false, error: "Invalid record ID" };

  if (parsedId) {
    const { data, error } = await sb
      .from(table)
      .update(payload)
      .eq("id", parsedId.data)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    return data ? { ok: true } : { ok: false, error: "This record no longer exists. Refresh and try again." };
  }

  const { error } = await sb.from(table).insert(payload);
  return error ? { ok: false, error: error.message } : { ok: true };
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
  const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
  const isImage = allowedImageTypes.has(file.type);
  if (!isImage && file.type !== "application/pdf") {
    return { ok: false, error: "Upload a PNG, JPEG, WebP, AVIF, GIF, or PDF file." };
  }
  if (file.type === "application/pdf" && payload.subarray(0, 5).toString() !== "%PDF-") {
    return { ok: false, error: "The selected file is not a valid PDF." };
  }
  let contentType = file.type;
  let ext = file.type === "application/pdf" ? "pdf" : (file.type.split("/")[1] ?? "img").replace("jpeg", "jpg");

  // Validate image bytes, then auto-compress supported raster formats to WebP.
  if (isImage) {
    try {
      const sharp = (await import("sharp")).default;
      const image = sharp(payload, { failOn: "error" });
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height) throw new Error("Invalid image dimensions");
      if (file.type !== "image/webp") {
        payload = await image.webp({ quality: 82 }).toBuffer();
        contentType = "image/webp";
        ext = "webp";
      }
    } catch (err) {
      return { ok: false, error: `Invalid or unsupported image: ${(err as Error).message}` };
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
    const rawId = String(formData.get("id") ?? "").trim();
    let previousSlug: string | null = null;
    if (rawId) {
      const { data: previous } = await sb.from("projects").select("slug").eq("id", rawId).maybeSingle();
      previousSlug = previous?.slug ?? null;
    }
    const saved = await saveContentRow(sb, "projects", formData, {
      ...parsed.data,
      tagline: parsed.data.tagline || null,
    });
    if (!saved.ok) return saved;
    revalidatePublic();
    revalidatePath(`/projects/${parsed.data.slug}`);
    if (previousSlug && previousSlug !== parsed.data.slug) revalidatePath(`/projects/${previousSlug}`);
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
    const saved = await saveContentRow(sb, "experiences", formData, {
      ...parsed.data,
      location: parsed.data.location || null,
    });
    if (!saved.ok) return saved;
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
    const saved = await saveContentRow(sb, "certifications", formData, parsed.data);
    if (!saved.ok) return saved;
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
    const saved = await saveContentRow(sb, "achievements", formData, {
      ...parsed.data,
      detail: parsed.data.detail || null,
    });
    if (!saved.ok) return saved;
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
    const saved = await saveContentRow(sb, "skills", formData, parsed.data);
    if (!saved.ok) return saved;
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
    const rawDate = published_at ? new Date(published_at) : null;
    if (rawDate && Number.isNaN(rawDate.getTime())) {
      return { ok: false, error: "Enter a valid publication date" };
    }
    const rawId = String(formData.get("id") ?? "").trim();
    const existingQuery = sb.from("posts").select("published_at, slug");
    const { data: existing } = rawId
      ? await existingQuery.eq("id", rawId).maybeSingle()
      : await existingQuery.eq("slug", parsed.data.slug).maybeSingle();
    const saved = await saveContentRow(sb, "posts", formData, {
      ...rest,
      excerpt: rest.excerpt || null,
      cover_image: rest.cover_image || null,
      published_at:
        rawDate?.toISOString() ?? existing?.published_at ?? (rest.published ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    });
    if (!saved.ok) return saved;
    revalidatePublic();
    revalidatePath(`/writeups/${parsed.data.slug}`);
    if (existing?.slug && existing.slug !== parsed.data.slug) {
      revalidatePath(`/writeups/${existing.slug}`);
    }
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

/** Update the resume URL without overwriting unrelated site settings. */
export async function saveResumeUrl(url: string): Promise<ActionResult> {
  return withDb(async (sb) => {
    const parsed = resumeUrlSchema.safeParse(url);
    if (!parsed.success) return { ok: false, error: "Enter a valid resume URL" };
    const { error } = await sb.from("settings").upsert(
      { key: "resumeUrl", value: parsed.data, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (error) return { ok: false, error: error.message };
    revalidatePublic();
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
