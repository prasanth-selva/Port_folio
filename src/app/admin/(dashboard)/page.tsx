import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type TableStats = {
  projects: number;
  experiences: number;
  certifications: number;
  skills: number;
  posts: number;
};
type Visit = { day: string; views: number };

async function loadDashboard() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const sb = supabaseAdmin();
  const startDay = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [projects, experiences, certifications, skills, posts, messages, visitRows] = await Promise.all([
    sb.from("projects").select("id", { count: "exact", head: true }),
    sb.from("experiences").select("id", { count: "exact", head: true }),
    sb.from("certifications").select("id", { count: "exact", head: true }),
    sb.from("skills").select("id", { count: "exact", head: true }),
    sb.from("posts").select("id", { count: "exact", head: true }),
    sb.from("messages").select("id, name, subject, read, created_at").order("created_at", { ascending: false }).limit(5),
    sb.from("analytics_daily").select("day, views").gte("day", startDay).order("day", { ascending: true }).limit(14),
  ]);

  const stats: TableStats = {
    projects: projects.count ?? 0,
    experiences: experiences.count ?? 0,
    certifications: certifications.count ?? 0,
    skills: skills.count ?? 0,
    posts: posts.count ?? 0,
  };
  const byDay = new Map(
    (visitRows.data ?? []).map((row) => [String(row.day), Number(row.views) || 0])
  );
  const visits: Visit[] = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(Date.now() - (13 - index) * 24 * 60 * 60 * 1000);
    const day = date.toISOString().slice(0, 10);
    return { day, views: byDay.get(day) ?? 0 };
  });

  return {
    stats,
    messages: messages.data ?? [],
    visits,
    analyticsAvailable: !visitRows.error,
  };
}

export default async function AdminDashboard() {
  const data = await loadDashboard();

  if (!data) {
    return (
      <div className="surface rounded-md p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Dashboard</h1>
        <p className="mt-4 rounded-md border border-[#2E3238] bg-[#202228] px-4 py-3 font-sans text-xs text-[#D4D6DB]">
          Supabase is not configured. The public site runs on seed data; the
          admin CRUD needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
          See README → “Database setup”.
        </p>
      </div>
    );
  }

  const { stats, messages, visits, analyticsAvailable } = data;
  const cards: { label: string; value: number; href: string }[] = [
    { label: "Projects", value: stats.projects, href: "/admin/projects" },
    { label: "Experience", value: stats.experiences, href: "/admin/experience" },
    { label: "Certifications", value: stats.certifications, href: "/admin/certifications" },
    { label: "Skills", value: stats.skills, href: "/admin/skills" },
    { label: "Writeups", value: stats.posts, href: "/admin/writeups" },
  ];
  const maxVisits = Math.max(1, ...visits.map((visit) => visit.views));
  const hasVisits = visits.some((visit) => visit.views > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Dashboard</h1>
        <p className="mt-1 font-sans text-xs text-white/40">SYSTEM STATUS: CONTENT CHANNELS ONLINE</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="surface rounded-md p-5 transition-colors hover:border-accent-metal/30">
            <p className="text-3xl font-semibold tabular-nums text-white/90">{card.value}</p>
            <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-white/40">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-xs uppercase tracking-[0.25em] text-[#9CA3AF]">Recent messages</h2>
            <Link href="/admin/inbox" className="font-sans text-[11px] text-accent-metal hover:underline">
              Inbox →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {messages.map((message) => (
              <li key={message.id} className="rounded-md border border-white/8 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-white/85">{message.name}</p>
                  {!message.read && <span className="h-2 w-2 shrink-0 rounded-md bg-accent-metal" aria-label="unread" />}
                </div>
                <p className="mt-0.5 truncate font-sans text-[11px] text-white/40">{message.subject ?? "(no subject)"}</p>
              </li>
            ))}
            {messages.length === 0 && (
              <li className="rounded-md border border-dashed border-white/10 p-6 text-center font-sans text-xs text-white/30">
                Inbox empty.
              </li>
            )}
          </ul>
        </div>

        <div className="surface rounded-md p-6">
          <h2 className="font-sans text-xs uppercase tracking-[0.25em] text-[#9CA3AF]">Homepage views — last 14 days</h2>
          {!analyticsAvailable ? (
            <p className="mt-4 rounded-md border border-[#2E3238] bg-[#202228] p-4 font-sans text-xs text-[#D4D6DB]">
              Analytics storage is not ready. Apply migration `0002_analytics.sql` to enable this chart.
            </p>
          ) : !hasVisits ? (
            <p className="mt-4 rounded-md border border-dashed border-white/10 p-6 text-center font-sans text-xs text-white/30">
              No homepage visits recorded yet.
            </p>
          ) : (
            <div className="mt-6 flex h-32 items-end gap-1.5" role="img" aria-label="Homepage views over the last 14 days">
              {visits.map((visit) => (
                <div key={visit.day} className="group relative flex-1" title={`${visit.day}: ${visit.views} views`}>
                  <div
                    className="w-full rounded-t bg-accent-metal transition-all"
                    style={{ height: `${Math.max(visit.views ? 4 : 1, (visit.views / maxVisits) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
