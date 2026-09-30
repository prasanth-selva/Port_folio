import Link from "next/link";

import WriteupsList from "@/components/admin/WriteupsList";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminWriteupsPage() {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!hasSupabase) {
    return (
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Writeups</h1>
        <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 font-mono text-xs text-amber-300">
          Supabase is not configured. Writeups are stored in Postgres —
          configure env vars to manage them here.
        </p>
      </div>
    );
  }

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("posts")
    .select("id, slug, title, tags, published, published_at")
    .order("published_at", { ascending: false, nullsFirst: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Writeups</h1>
        <Link
          href="/admin/writeups/new"
          className="rounded-xl bg-accent-cyan px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-black transition-shadow hover:shadow-glow-sm"
        >
          + New writeup
        </Link>
      </div>
      <div className="mt-6">
        <WriteupsList posts={(data ?? []) as never} />
      </div>
    </div>
  );
}
