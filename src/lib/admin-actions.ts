"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

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
 */

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  return session;
}

type ActionResult = { ok: true } | { ok: false; error: string };

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/projects", "layout");
  revalidatePath("/writeups", "layout");
}

// ---------------------------------------------------------------- uploads
export async function uploadMedia(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided" };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "File too large (max 8 MB)" };
  }

  const sb = supabaseAdmin();

  // Auto-compress raster images to WebP via sharp; PDFs pass through.
  const isImage = file.type.startsWith("image/");
  let payload: Buffer = Buffer.from(await file.arrayBuffer());
  let contentType = file.type;
  let ext = (file.name.split(".").pop() ?? "bin").toLowerCase();

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

  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60) || "file";
  const path = `${Date.now()}-${safeBase}.${ext}`;

  const { error } = await sb.storage.from("media").upload(path, payload, {
    contentType,
    upsert: false,
  });
  if (error) return { ok: false, error: error.message };

  const { data } = sb.storage.from("media").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// --------------------------------------------------------------- projects
export async function saveProject(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
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
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("projects")
    .upsert({ ...parsed.data, tagline: parsed.data.tagline || null }, { onConflict: "slug" });
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  revalidatePath(`/projects/${parsed.data.slug}`);
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

// ------------------------------------------------------------- experiences
export async function saveExperience(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = experienceSchema.safeParse({
    ...Object.fromEntries(formData),
    tech: String(formData.get("tech") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    current: formData.get("current") === "on",
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const sb = supabaseAdmin();
  const { error } = await sb.from("experiences").upsert({
    ...parsed.data,
    location: parsed.data.location || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("experiences").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

// ---------------------------------------------------------- certifications
export async function saveCertification(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = certificationSchema.safeParse({
    ...Object.fromEntries(formData),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const { error } = await supabaseAdmin()
    .from("certifications")
    .upsert(parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("certifications").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

// ------------------------------------------------------------ achievements
export async function saveAchievement(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = achievementSchema.safeParse({
    ...Object.fromEntries(formData),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const { error } = await supabaseAdmin().from("achievements").upsert({
    ...parsed.data,
    detail: parsed.data.detail || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

export async function deleteAchievement(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("achievements").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

// ----------------------------------------------------------------- skills
export async function saveSkill(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = skillSchema.safeParse({
    ...Object.fromEntries(formData),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const { error } = await supabaseAdmin().from("skills").upsert(parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("skills").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

// Reorder: pass an array of ids in the desired order.
export async function reorderTable(
  table: "projects" | "experiences" | "certifications" | "achievements" | "skills",
  ids: string[]
): Promise<ActionResult> {
  await requireAdmin();
  const sb = supabaseAdmin();
  const updates = ids.map((id, i) => ({ id, sort_order: i + 1 }));
  const { error } = await sb.from(table).upsert(updates, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

// ------------------------------------------------------------------ posts
export async function savePost(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = postSchema.safeParse({
    ...Object.fromEntries(formData),
    tags: String(formData.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const { published_at, ...rest } = parsed.data;
  const sb = supabaseAdmin();
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
      published_at: published_at ? new Date(published_at).toISOString() : (existing?.published_at ?? new Date().toISOString()),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  revalidatePath(`/writeups/${parsed.data.slug}`);
  return { ok: true };
}

export async function deletePost(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

// --------------------------------------------------------------- settings
export async function saveSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    ...Object.fromEntries(formData),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const sb = supabaseAdmin();
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
}

// ---------------------------------------------------------------- inbox
export async function markMessageRead(id: string, read: boolean): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("messages").update({ read }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin().from("messages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
  return { ok: true };
}

// -------------------------------------------------------------- analytics
export async function trackVisit(path: string): Promise<void> {
  // Lightweight visit counter stored in settings (no cookies, no PII).
  try {
    const sb = supabaseAdmin();
    const key = `visits:${new Date().toISOString().slice(0, 10)}`;
    const { data } = await sb.from("settings").select("value").eq("key", key).single();
    const current = typeof data?.value === "number" ? (data.value as number) : 0;
    await sb
      .from("settings")
      .upsert({ key, value: current + 1, updated_at: new Date().toISOString() }, { onConflict: "key" });
  } catch {
    // Analytics is best-effort; never break the page.
  }
  void path;
}
