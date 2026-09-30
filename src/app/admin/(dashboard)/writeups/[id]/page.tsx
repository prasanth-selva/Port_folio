import { notFound } from "next/navigation";

import { MdxEditor } from "@/components/admin/MdxEditor";
import { deletePost, savePost } from "@/lib/admin-actions";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function EditWriteupPage({
  params,
}: {
  params: { id: string };
}) {
  const sb = supabaseAdmin();
  const { data } = await sb.from("posts").select("*").eq("id", params.id).single();
  if (!data) notFound();

  return (
    <MdxEditor
      post={{
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags ?? [],
        cover_image: data.cover_image,
        reading_minutes: data.reading_minutes ?? 4,
        published: data.published ?? true,
      }}
      saveAction={savePost}
      deleteAction={deletePost}
    />
  );
}
