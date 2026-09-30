"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  FALLBACK_MANIFEST,
  type SequenceManifest,
  frameUrls,
} from "@/lib/sequence";
import { paintFallbackFrame } from "@/components/hero/fallback-painter";
import { HeroOverlay } from "@/components/hero/HeroOverlay";

type Props = {
  /** e.g. "B.E. CSE (Cybersecurity) — Class of 2027" */
  badge: string;
  resumeUrl: string | null;
};

/**
 * Sticky scrollytelling hero.
 *
 * - Outer section is h-[400vh]; the canvas sticks for the full scroll length.
 * - All frames are preloaded (with a live percentage) before the animation
 *   starts, guaranteeing zero mid-scroll decode hitches.
 * - Scroll progress (0..1) maps onto frame index; a rAF loop lerps toward the
 *   target frame for butter-smooth motion even on jumpy trackpads.
 * - If the manifest/preload fails, a procedural canvas-drawn core takes over.
 */
export default function CyberCoreScroll({ badge, resumeUrl }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [manifest, setManifest] = useState<SequenceManifest | null>(null);
  const [progress, setProgress] = useState(0); // 0..1 preload progress
  const [ready, setReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // --- Manifest discovery ---------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/sequence/manifest.json", { cache: "force-cache" });
        if (!res.ok) throw new Error(`manifest ${res.status}`);
        const m = (await res.json()) as SequenceManifest;
        if (!m || typeof m.count !== "number" || m.count <= 0) {
          throw new Error("invalid manifest");
        }
        if (!cancelled) setManifest(m);
      } catch {
        if (!cancelled) setUseFallback(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Preload + paint loop --------------------------------------------------
  useEffect(() => {
    if (!manifest) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let disposed = false;
    const urls = frameUrls(manifest);
    const images: HTMLImageElement[] = new Array(urls.length);

    let loaded = 0;
    let cancelled = false;

    const drawCover = (img: HTMLImageElement) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    };

    // Paint frame 0 immediately once available so there is never a blank hero.
    const firstImg = new Image();
    firstImg.decoding = "async";
    firstImg.src = urls[0]!;
    firstImg
      .decode()
      .then(() => {
        if (!cancelled && !disposed) drawCover(firstImg);
      })
      .catch(() => {});

    const preload = Promise.all(
      urls.map(
        (url, i) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.decoding = "async";
            img.onload = () => {
              images[i] = img;
              loaded += 1;
              setProgress(loaded / urls.length);
              resolve();
            };
            img.onerror = () => {
              loaded += 1;
              setProgress(loaded / urls.length);
              resolve();
            };
            img.src = url;
          })
      )
    );

    preload
      .then(() => {
        if (cancelled || disposed) return;
        const ok = images.filter(Boolean).length > urls.length * 0.9;
        if (!ok) {
          setUseFallback(true);
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled && !disposed) setUseFallback(true);
      });

    // --- rAF painter with lerp smoothing ---
    let raf = 0;
    let current = 0; // fractional frame index currently painted
    let lastPainted = -1;

    const paint = () => {
      if (disposed) return;
      if (ready) {
        const target = scrollYProgress.get() * (urls.length - 1);
        // Lerp toward target; 0.18 gives responsive-but-smooth tracking.
        current += (target - current) * 0.18;
        if (Math.abs(target - current) < 0.05) current = target;
        const idx = Math.round(current);
        if (idx !== lastPainted) {
          const img = images[idx];
          if (img) {
            drawCover(img);
            lastPainted = idx;
          }
        }
      }
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);

    const onResize = () => {
      const idx = Math.round(current);
      const img = images[idx] ?? images[0];
      if (img) drawCover(img);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      // Explicitly release image memory.
      images.length = 0;
    };
  }, [manifest, ready, scrollYProgress]);

  // --- Fallback painter loop (procedural cyber-core) -------------------------
  useEffect(() => {
    if (!useFallback) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const stop = paintFallbackFrame(ctx, canvas, scrollYProgress);
    return stop;
  }, [useFallback, scrollYProgress]);

  return (
    <section ref={sectionRef} className="relative h-[400vh]" aria-label="Introduction">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-base">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        {/* Cinematic vignette to blend frame edges into the page */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(5,5,5,0.55) 82%, #050505 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{ background: "linear-gradient(to bottom, transparent, #050505)" }}
          aria-hidden="true"
        />

        {!useFallback && (
          <HeroOverlay
            scrollYProgress={scrollYProgress}
            badge={badge}
            resumeUrl={resumeUrl}
          />
        )}

        {/* Preloader */}
        {!ready && !useFallback && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-base">
            <div className="flex flex-col items-center gap-5">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 animate-spin rounded-full border border-white/10 border-t-accent-cyan [animation-duration:1.1s]" />
                <div className="absolute inset-2 animate-spin rounded-full border border-white/5 border-b-accent-violet/70 [animation-duration:1.8s] [animation-direction:reverse]" />
              </div>
              <div className="font-mono text-xs tracking-[0.3em] text-white/50">
                LOADING SEQUENCE {String(Math.round(progress * 100)).padStart(3, "0")}%
              </div>
              <div className="h-px w-48 overflow-hidden bg-white/10">
                <div
                  className="h-full bg-accent-cyan transition-[width] duration-150 ease-out"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fallback notice (disappears into the visuals) */}
        {useFallback && (
          <HeroOverlay
            scrollYProgress={scrollYProgress}
            badge={badge}
            resumeUrl={resumeUrl}
          />
        )}
      </div>
    </section>
  );
}
