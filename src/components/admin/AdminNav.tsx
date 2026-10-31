"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/certifications", label: "Certifications" },
  { href: "/admin/achievements", label: "Achievements" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/writeups", label: "Writeups" },
  { href: "/admin/resume", label: "Resume" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav({ unread, compact }: { unread: number; compact?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={`mt-4 grid gap-1.5 ${compact ? "grid-cols-2 sm:grid-cols-3" : ""}`} aria-label="Admin">
      {ITEMS.map((item) => {
        const p = pathname ?? "";
        const active =
          item.href === "/admin" ? p === "/admin" : p.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 font-sans text-xs uppercase tracking-[0.15em] transition-colors ${
              active
                ? "border border-accent-metal/30 bg-accent-metal/[0.12] text-white font-semibold"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span className="truncate">{item.label}</span>
            {item.href === "/admin/inbox" && unread > 0 && (
              <span className="ml-2 rounded-full bg-accent-metal px-2 py-0.5 text-[10px] font-bold text-black">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
