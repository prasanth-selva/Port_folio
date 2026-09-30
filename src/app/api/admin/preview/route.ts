import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/** Renders markdown to HTML for the admin live preview (auth-only, no persistence). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let mdx = "";
  try {
    const body = (await req.json()) as { mdx?: string };
    mdx = String(body.mdx ?? "").slice(0, 60_000);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Strip frontmatter for preview.
  const body = mdx.replace(/^---\n[\s\S]*?\n---\n?/, "");

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify)
    .process(body);

  // Split into top-level blocks so the client can mount them safely.
  const html = String(file)
    .split(/(?=<h2[\s>])/)
    .filter(Boolean);

  return NextResponse.json({ html });
}
