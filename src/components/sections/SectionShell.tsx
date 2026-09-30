import type { ReactNode } from "react";

/**
 * Consistent vertical rhythm + optional faint-grid backdrop for sections.
 * `kind="hero"` renders children without padding (scrollytelling manages its own).
 */
export default function SectionShell({
  children,
  kind = "plain",
  id,
}: {
  children: ReactNode;
  kind?: "plain" | "grid" | "hero";
  id?: string;
}) {
  if (kind === "hero") {
    return <div id={id}>{children}</div>;
  }
  return (
    <section id={id} className="relative scroll-mt-20">
      {kind === "grid" && <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />}
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">{children}</div>
    </section>
  );
}
