"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor: cyan dot + trailing ring. Grows over interactive elements.
 * Only activates on fine pointers; native cursor stays untouched otherwise.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let hover = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const target = e.target as HTMLElement | null;
      hover = Boolean(
        target?.closest("a, button, [role='button'], input, textarea, select, [data-cursor='hover']")
      );
    };

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${hover ? 1.9 : 1})`;
      ring.style.borderColor = hover ? "rgba(0,240,255,0.85)" : "rgba(0,240,255,0.4)";
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent-cyan"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-accent-cyan/40 transition-[border-color] duration-200"
      />
    </div>
  );
}
