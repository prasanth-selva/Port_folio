"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Line = { text: string; tone?: "in" | "out" | "err" | "ok" };

const HELP: Line[] = [
  { text: "available commands:", tone: "ok" },
  { text: "  whoami        — identify the operator" },
  { text: "  ls projects   — list deployed missions" },
  { text: "  skills        — print the stack" },
  { text: "  contact       — open a secure channel" },
  { text: "  goto <sect>   — navigate (about|experience|projects|skills|contact)" },
  { text: "  clear         — wipe the scrollback" },
  { text: "  exit          — detach session" },
];

export default function TerminalEasterEgg() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { text: "┌─[prasanth@portfolio]─[~]", tone: "ok" },
    { text: "└─$ type `help` for commands — or `whoami` if you're curious", tone: "out" },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const print = useCallback((newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      print([{ text: `└─$ ${cmd}`, tone: "in" }]);
      const parts = cmd.split(/\s+/);
      const base = parts[0] ?? "";
      const args = parts.slice(1);
      switch (base.toLowerCase()) {
        case "help":
          print(HELP);
          break;
        case "whoami":
          print([
            { text: "prasanth selva — b.e. cse (cybersecurity), class of 2027", tone: "out" },
            { text: "aspiring cybersecurity engineer | VYUGAM president | CTF player", tone: "out" },
            { text: "motto: i break things to secure them.", tone: "ok" },
          ]);
          break;
        case "ls":
          if (args[0]?.toLowerCase() === "projects") {
            print([
              { text: "cyberthozhan/   edumentor-ai/   hackastorm/   isc-realtors/", tone: "out" },
              { text: "tip: scroll to #projects or `goto projects`", tone: "ok" },
            ]);
          } else {
            print([
              { text: "about/  experience/  projects/  skills/  achievements/  certifications/  contact/", tone: "out" },
            ]);
          }
          break;
        case "skills":
          print([
            { text: "[core]    linux · python · bash", tone: "out" },
            { text: "[defense] siem · ids/ips", tone: "out" },
            { text: "[offense] web-security · burp-suite · metasploit", tone: "out" },
            { text: "[build]   next.js · fastapi · ollama/rag", tone: "out" },
          ]);
          break;
        case "contact":
          print([{ text: "opening secure channel → #contact", tone: "ok" }]);
          setTimeout(() => {
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          }, 400);
          break;
        case "goto": {
          const map: Record<string, string> = {
            about: "about",
            experience: "experience",
            projects: "projects",
            skills: "skills",
            achievements: "achievements",
            certifications: "certifications",
            contact: "contact",
          };
          const id = map[(args[0] ?? "").toLowerCase()];
          if (id) {
            print([{ text: `navigating → #${id}`, tone: "ok" }]);
            setTimeout(() => {
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }, 300);
          } else {
            print([{ text: `goto: unknown section '${args[0] ?? ""}'`, tone: "err" }]);
          }
          break;
        }
        case "clear":
          setLines([]);
          break;
        case "exit":
          setOpen(false);
          break;
        case "sudo":
          print([{ text: "nice try. incident reported to /dev/null.", tone: "err" }]);
          break;
        default:
          print([{ text: `command not found: ${base} — try \`help\``, tone: "err" }]);
      }
    },
    [print]
  );

  // Global backtick listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "`") return;
      const target = e.target as HTMLElement | null;
      const typingElsewhere =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (!open && typingElsewhere) return;
      e.preventDefault();
      setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus + autoscroll when open
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [open, lines]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = value;
      setValue("");
      if (v.trim()) {
        setHistory((h) => [v, ...h]);
        setHIdx(-1);
      }
      run(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(hIdx + 1, history.length - 1);
      if (next >= 0) {
        setHIdx(next);
        setValue(history[next] ?? "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = hIdx - 1;
      setHIdx(next);
      setValue(next >= 0 ? history[next] ?? "" : "");
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-x-4 bottom-6 z-[65] mx-auto max-w-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
          role="dialog"
          aria-label="Easter-egg terminal"
        >
          <div className="glass overflow-hidden rounded-2xl border-accent-cyan/20 shadow-glow">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <span className="font-mono text-[11px] tracking-[0.25em] text-white/50">
                PRASANTH@PORTFOLIO — TTY1
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono text-[11px] text-white/40 transition-colors hover:text-accent-cyan"
                aria-label="Close terminal"
              >
                [esc]
              </button>
            </div>
            <div ref={scrollRef} className="max-h-72 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed">
              {lines.map((l, i) => (
                <p
                  key={i}
                  className={
                    l.tone === "in"
                      ? "text-white/90"
                      : l.tone === "err"
                        ? "text-red-400/90"
                        : l.tone === "ok"
                          ? "text-accent-cyan"
                          : "text-white/60"
                  }
                >
                  {l.text}
                </p>
              ))}
              <div className="mt-1 flex items-center gap-2">
                <span className="text-accent-cyan">└─$</span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="w-full bg-transparent text-white/90 caret-accent-cyan outline-none"
                  aria-label="Terminal input"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
