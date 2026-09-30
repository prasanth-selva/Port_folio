import type { SiteSettings } from "@/lib/data";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-sm font-semibold tracking-tight text-white/90">
            <span className="text-accent-cyan">&gt;_</span> prasanth.selva
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/50">
            Aspiring cybersecurity engineer. Breaking things responsibly since
            the first segfault.
          </p>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs text-white/50">
          <a href={`mailto:${settings.email}`} className="transition-colors hover:text-accent-cyan">
            {settings.email}
          </a>
          <a
            href={settings.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent-cyan"
          >
            linkedin/in/prasanth-selva
          </a>
          <a
            href={settings.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent-cyan"
          >
            github/prasanth-selva
          </a>
        </div>

        <p className="font-mono text-[11px] tracking-[0.2em] text-white/30">
          © {year} — BUILT WITH NEXT.JS + ♥ + CAFFEINE
        </p>
      </div>
    </footer>
  );
}
