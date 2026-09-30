import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import { supabasePublic } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Guarded admin shell. Lives in the (dashboard) route group so
 * /admin/login renders without it (breaking the login redirect loop).
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  // Unread badge
  let unread = 0;
  const sb = supabasePublic();
  if (sb) {
    const { count } = await sb
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false);
    unread = count ?? 0;
  }

  return (
    <div className="min-h-screen bg-base">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="sticky top-8 hidden h-fit w-56 shrink-0 md:block">
          <p className="font-mono text-sm font-semibold tracking-tight text-white/90">
            <span className="text-accent-cyan">&gt;_</span> admin
          </p>
          <AdminNav unread={unread} />
          <form action="/api/admin/signout" method="post">
            <button
              type="submit"
              className="mt-6 w-full rounded-xl border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:border-red-400/40 hover:text-red-400"
            >
              Sign out
            </button>
          </form>
        </aside>
        <main className="min-w-0 flex-1">
          {/* Mobile nav */}
          <div className="mb-6 md:hidden">
            <p className="font-mono text-sm font-semibold tracking-tight text-white/90">
              <span className="text-accent-cyan">&gt;_</span> admin
            </p>
            <AdminNav unread={unread} compact />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
