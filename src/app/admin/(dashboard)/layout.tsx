import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import { supabaseAdmin } from "@/lib/supabase";

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
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { count } = await supabaseAdmin()
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      unread = count ?? 0;
    } catch {
      // Keep navigation usable when the inbox database is temporarily offline.
    }
  }

  return (
    <div className="min-h-screen bg-[#070708] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:gap-12 md:py-14">
        <aside className="sticky top-10 h-fit w-full shrink-0 md:w-64">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 md:flex-col md:items-start md:border-b-0 md:pb-0">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-metal/70">
                MANISHA.NITHYA
              </p>
              <h2 className="mt-1 font-sans text-lg font-bold tracking-tight text-white">
                Admin Control Center
              </h2>
            </div>
            <form action="/api/admin/signout" method="post" className="hidden md:block md:mt-6 w-full">
              <button
                type="submit"
                className="w-full rounded-lg border border-red-500/20 bg-red-500/[0.04] px-4 py-2.5 font-sans text-xs uppercase tracking-[0.2em] text-red-400 transition-colors hover:bg-red-500/15"
              >
                Sign out
              </button>
            </form>
          </div>
          <div className="mt-6 md:block">
            <AdminNav unread={unread} />
          </div>
          <div className="mt-6 md:hidden">
            <form action="/api/admin/signout" method="post">
              <button
                type="submit"
                className="w-full rounded-lg border border-red-500/20 bg-red-500/[0.04] px-4 py-2.5 font-sans text-xs uppercase tracking-[0.2em] text-red-400 transition-colors hover:bg-red-500/15"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="surface rounded-xl p-6 md:p-10 border border-white/10 bg-[#111318]/80 shadow-xl backdrop-blur">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
