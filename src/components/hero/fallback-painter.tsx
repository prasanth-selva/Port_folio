import type { MotionValue } from "framer-motion";

/**
 * Flat fallback drawing used only when the real hero frame sequence is unavailable.
 * It keeps the page usable without adding extra decorative effects.
 */
export function paintFallbackFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  progress: MotionValue<number>
): () => void {
  let raf = 0;
  let disposed = false;

  const draw = () => {
    if (disposed) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0B0B0C";
    ctx.fillRect(0, 0, w, h);

    const explode = Math.sin(progress.get() * Math.PI);
    const cx = w / 2;
    const cy = h / 2;
    const size = Math.min(w, h) * 0.22 * (1 + explode * 0.12);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "#ECEFF3";
    ctx.fillStyle = "#ECEFF3";
    ctx.lineWidth = 2;
    ctx.lineJoin = "miter";

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.7, -size * 0.66);
    ctx.lineTo(size * 0.7, size * 0.1);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.7, size * 0.1);
    ctx.lineTo(-size * 0.7, -size * 0.66);
    ctx.closePath();
    ctx.stroke();

    const chip = size * 0.42;
    ctx.strokeStyle = "#F2EEE6";
    ctx.strokeRect(-chip / 2, -chip / 2, chip, chip);
    for (let i = 0; i < 4; i += 1) {
      const offset = -chip / 2 + (chip / 3) * i;
      ctx.beginPath();
      ctx.moveTo(offset, -chip / 2 - 12);
      ctx.lineTo(offset, -chip / 2);
      ctx.moveTo(offset, chip / 2);
      ctx.lineTo(offset, chip / 2 + 12);
      ctx.stroke();
    }

    ctx.fillStyle = "#ECEFF3";
    ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();

    raf = requestAnimationFrame(draw);
  };

  raf = requestAnimationFrame(draw);
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
  };
}
