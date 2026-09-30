import Link from "next/link";

import { InboxActions } from "@/components/admin/InboxActions";
import { supabaseAdmin } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!hasSupabase) {
    return (
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Inbox</h1>
        <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 font-mono text-xs text-amber-300">
          Supabase not configured — messages cannot be stored or listed.
        </p>
      </div>
    );
  }

  const sb = supabaseAdmin();
  const { data: messages } = await sb
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white/90">Inbox</h1>
      <p className="mt-1 font-mono text-xs text-white/40">
        {messages?.filter((m) => !m.read).length ?? 0} UNREAD / {messages?.length ?? 0} TOTAL
      </p>

      <ul className="mt-6 space-y-3">
        {(messages ?? []).map((m) => (
          <li
            key={m.id}
            className={`glass rounded-2xl p-5 ${m.read ? "" : "border-accent-cyan/25"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-white/90">
                  {m.name}{" "}
                  <a
                    href={`mailto:${m.email}`}
                    className="font-mono text-xs text-accent-cyan/80 hover:underline"
                  >
                    {m.email}
                  </a>
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-white/40">
                  {formatDate(m.created_at)} — {m.subject ?? "(no subject)"}
                </p>
              </div>
              <InboxActions id={m.id} read={m.read} replyMailto={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Your message"}`)}`} />
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/60">
              {m.body}
            </p>
          </li>
        ))}
        {(messages ?? []).length === 0 && (
          <li className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center font-mono text-xs text-white/30">
            Inbox empty — the contact form writes here.
          </li>
        )}
      </ul>

      <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-white/25">
        RETURN TO <Link href="/admin" className="text-accent-cyan/70 hover:underline">DASHBOARD</Link>
      </p>
    </div>
  );
}
