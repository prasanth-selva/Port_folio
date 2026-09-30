import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type TableStats = { projects: number; experiences: number; certifications: number; skills: number; posts: number };

async function loadDashboard() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  const sb = supabaseAdmin();
  const [projects, experiences, certifications, skills, posts, messages, visits] = await Promise.all([
    sb.from("projects").select("*", { count: "exact", head: true }),
    sb.from("experiences").select("*", { count: "exact", head: true }),
    sb.from("certifications").select("*", { count: "exact", head: true }),
    sb.from("skills").select("*", { count: "exact", head: true }),
    sb.from("posts").select("*", { count: "exact", head: true }),
    sb.from("messages").select("*").order("created_at", { ascending: false }).limit(5),
    sb.from("settings").select("key, value").like("key", "visits:%").order("key", { ascending: false }).limit(14),
  ]);

  const stats: TableStats = {
    projects: projects.count ?? 0,
    experiences: experiences.count ?? 0,
    certifications: certifications.count ?? 0,
    skills: skills.count ?? 0,
    posts: posts.count ?? 0,
  };
  return { stats, messages: messages.data ?? [], visits: (visits.data ?? []) as { key: string; value: unknown }[] };
}

export default async function AdminDashboard() {
  const data = await loadDashboard();

  if (!data) {
    return (
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Dashboard</h1>
        <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 font-mono text-xs text-amber-300">
          Supabase is not configured. The public site runs on seed data; the
          admin CRUD needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
          See README → “Database setup”.
        </p>
      </div>
    );
  }

  const { stats, messages, visits } = data;
  const cards: { label: string; value: number; href: string }[] = [
    { label: "Projects", value: stats.projects, href: "/admin/projects" },
    { label: "Experience", value: stats.experiences, href: "/admin/experience" },
    { label: "Certifications", value: stats.certifications, href: "/admin/certifications" },
    { label: "Skills", value: stats.skills, href: "/admin/skills" },
    { label: "Writeups", value: stats.posts, href: "/admin/writeups" },
  ];
  const maxVisits = Math.max(1, ...visits.map((v) => (typeof v.value === "number" ? v.value : 0)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Dashboard</h1>
        <p className="mt-1 font-mono text-xs text-white/40">SYSTEM STATUS: ALL CONTENT CHANNELS NOMINAL</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="glass rounded-2xl p-5 transition-colors hover:border-accent-cyan/30">
            <p className="text-3xl font-semibold tabular-nums text-white/90">{c.value}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">Recent messages</h2>
            <Link href="/admin/inbox" className="font-mono text-[11px] text-accent-cyan hover:underline">
              Inbox →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="rounded-xl border border-white/8 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-white/85">{m.name}</p>
                  {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent-cyan" aria-label="unread" />}
                </div>
                <p className="mt-0.5 truncate font-mono text-[11px] text-white/40">{m.subject ?? "(no subject)"}</p>
              </li>
            ))}
            {messages.length === 0 && (
              <li className="rounded-xl border border-dashed border-white/10 p-6 text-center font-mono text-xs text-white/30">
                Inbox empty.
              </li>
            )}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">Visits — last 14 days</h2>
          {visits.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-white/10 p-6 text-center font-mono text-xs text-white/30">
              No analytics yet (requires Supabase).
            </p>
          ) : (
            <div className="mt-6 flex h-32 items-end gap-1.5">
              {[...visits].reverse().map((v) => {
                const n = typeof v.value === "number" ? v.value : 0;
                return (
                  <div key={v.key} className="group relative flex-1" title={`${v.key.slice(7)}: ${n}`}>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-accent-cyan/30 to-accent-cyan/80 transition-all group-hover:to-accent-cyan"
                      style={{ height: `${Math.max(4, (n / maxVisits) * 100)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
