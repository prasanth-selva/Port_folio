"use client";

import { createClient } from "@supabase/supabase-js";

import { createMediaUploadGrant } from "@/lib/admin-actions";

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  pdf: "application/pdf",
};
const ALLOWED_TYPES = new Set(Object.values(MIME_BY_EXTENSION));
const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

/** Upload through a short-lived signed URL so file bytes never pass through Next/Vercel. */
export async function uploadMediaFile(file: File): Promise<{ url: string }> {
  if (!file || file.size <= 0) throw new Error("Choose a non-empty file to upload.");
  if (file.size > MAX_UPLOAD_SIZE) throw new Error("File too large (max 8 MB).");

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = file.type || MIME_BY_EXTENSION[extension] || "";
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error("Upload a PNG, JPEG, WebP, AVIF, GIF, or PDF file.");
  }

  if (contentType === "application/pdf") {
    const signature = await file.slice(0, 5).text();
    if (signature !== "%PDF-") throw new Error("The selected file is not a valid PDF.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error("Photo uploads need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY configured.");
  }

  const metadata = new FormData();
  metadata.set("name", file.name);
  metadata.set("contentType", contentType);
  metadata.set("size", String(file.size));
  const grant = await createMediaUploadGrant(metadata);
  if (!grant.ok) throw new Error(grant.error);

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.storage.from("media").uploadToSignedUrl(
    grant.path,
    grant.token,
    file,
    { contentType: grant.contentType, cacheControl: "3600" }
  );
  if (error) throw new Error(error.message);

  return { url: grant.url };
}
