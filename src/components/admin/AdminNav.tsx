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
    <nav className={`mt-4 grid gap-1 ${compact ? "" : ""}`} aria-label="Admin">
      {ITEMS.map((item) => {
        const p = pathname ?? "";
        const active =
          item.href === "/admin" ? p === "/admin" : p.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between rounded-xl px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
              active
                ? "border border-accent-cyan/30 bg-accent-cyan/[0.07] text-accent-cyan"
                : "text-white/50 hover:bg-white/[0.04] hover:text-white/85"
            }`}
          >
            {item.label}
            {item.href === "/admin/inbox" && unread > 0 && (
              <span className="rounded-full bg-accent-cyan px-2 py-0.5 text-[10px] font-bold text-black">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
