import type { ReactNode } from "react";

/**
 * Consistent vertical rhythm and simple section separators.
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
    <section id={id} className="scroll-mt-20 border-t border-[#202228]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}
