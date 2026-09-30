"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#achievements", label: "Achievements" },
  { href: "#contact", label: "Contact" },
] as const;

export default function Navbar() {
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6" aria-label="Primary">
        <a href="#top" className="font-mono text-sm font-semibold tracking-tight text-white/90">
          <span className="text-accent-cyan">&gt;_</span> prasanth.selva
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href ? "true" : undefined}
                className={`relative rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  active === l.href ? "text-accent-cyan" : "text-white/55 hover:text-white/90"
                }`}
              >
                {active === l.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/[0.07]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className={`h-px w-5 bg-white/80 transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`h-px w-5 bg-white/80 transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {open && (
        <motion.ul
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mx-4 mb-4 grid gap-1 rounded-2xl p-3 md:hidden"
        >
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] ${
                  active === l.href ? "bg-accent-cyan/10 text-accent-cyan" : "text-white/60"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </motion.ul>
      )}

      {/* Scroll progress hairline */}
      <motion.div
        style={{ scaleX: progress }}
        className="h-px origin-left bg-gradient-to-r from-accent-cyan via-accent-cyan/60 to-accent-violet"
        aria-hidden="true"
      />
    </header>
  );
}
