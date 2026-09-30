import type { MotionValue } from "framer-motion";

/**
 * Procedural "cyber-core" painter — a canvas-drawn shield + chip + padlock +
 * orbiting nodes that explodes and reassembles with scroll. Zero assets
 * required, so the hero works even without a generated frame sequence.
 */

type Node = {
  angle: number;
  dist: number;
  size: number;
  speed: number;
};

type Shard = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  hue: "cyan" | "violet";
};

export function paintFallbackFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  progress: MotionValue<number>
): () => void {
  let raf = 0;
  let disposed = false;

  const shards: Shard[] = Array.from({ length: 26 }, (_, i) => {
    const angle = (i / 26) * Math.PI * 2;
    const hue = i % 3 === 0 ? "violet" : "cyan";
    return {
      x: 0,
      y: 0,
      vx: Math.cos(angle) * (60 + Math.random() * 80),
      vy: Math.sin(angle) * (60 + Math.random() * 80),
      size: 6 + Math.random() * 16,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.8,
      hue,
    };
  });

  const nodes: Node[] = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    dist: 150 + Math.random() * 60,
    size: 2 + Math.random() * 3,
    speed: 0.06 + Math.random() * 0.15,
  }));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const draw = (t: number) => {
    if (disposed) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#080D12";
    ctx.fillRect(0, 0, w, h);

    const p = progress.get(); // 0..1 scroll progress
    // Explosion envelope: 0 -> assembled, 0.5 -> fully exploded, 1 -> reassembled
    const explode = Math.sin(p * Math.PI);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.22;
    const time = t / 1000;

    // Radial glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.6);
    glow.addColorStop(0, `rgba(115,224,190,${0.10 + explode * 0.08})`);
    glow.addColorStop(0.5, `rgba(179,160,255,${0.05 + explode * 0.05})`);
    glow.addColorStop(1, "rgba(8,13,18,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Orbiting network nodes + connecting lines
    ctx.lineWidth = 1;
    const pts: { x: number; y: number }[] = [];
    for (const n of nodes) {
      const a = n.angle + time * n.speed * (reduced ? 0 : 1);
      const d = n.dist * (1 + explode * 0.8);
      pts.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.72 });
    }
    ctx.strokeStyle = "rgba(115,224,190,0.18)";
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i]!;
        const b = pts[j]!;
        const dd = Math.hypot(a.x - b.x, a.y - b.y);
        if (dd < 160) {
          ctx.globalAlpha = 1 - dd / 160;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    for (const q of pts) {
      ctx.fillStyle = "rgba(115,224,190,0.7)";
      ctx.beginPath();
      ctx.arc(q.x, q.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Exploding shards
    for (const s of shards) {
      const d = explode * 260;
      const sx = cx + s.vx * (d / 140);
      const sy = cy + s.vy * (d / 140);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(s.rot + s.vr * explode * 3);
      ctx.strokeStyle =
        s.hue === "cyan" ? "rgba(115,224,190,0.52)" : "rgba(179,160,255,0.55)";
      ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size);
      ctx.restore();
    }

    // Core: shield outline
    const sw = R * (0.9 + explode * 0.15);
    const sh = R * 1.15 * (0.9 + explode * 0.15);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    const grad = ctx.createLinearGradient(0, -sh, 0, sh);
    grad.addColorStop(0, "rgba(115,224,190,0.95)");
    grad.addColorStop(1, "rgba(179,160,255,0.9)");
    ctx.strokeStyle = grad;
    ctx.shadowColor = "rgba(115,224,190,0.45)";
    ctx.shadowBlur = 18 + explode * 24;
    ctx.beginPath();
    ctx.moveTo(0, -sh / 2);
    ctx.lineTo(sw / 2, -sh / 4);
    ctx.lineTo(sw / 2, sh / 6);
    ctx.quadraticCurveTo(sw / 2, sh / 2, 0, sh / 2);
    ctx.quadraticCurveTo(-sw / 2, sh / 2, -sw / 2, sh / 6);
    ctx.lineTo(-sw / 2, -sh / 4);
    ctx.closePath();
    ctx.stroke();

    // Chip inside the shield
    const chip = R * 0.34;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.strokeRect(-chip / 2, -chip / 2 - R * 0.05, chip, chip);
    for (let i = 0; i < 4; i++) {
      const off = -chip / 2 + (chip / 3) * i;
      const pin = chip * 0.22;
      ctx.beginPath();
      ctx.moveTo(off, -chip / 2 - R * 0.05 - pin); ctx.lineTo(off, -chip / 2 - R * 0.05);
      ctx.moveTo(off, chip / 2 - R * 0.05); ctx.lineTo(off, chip / 2 - R * 0.05 + pin);
      ctx.moveTo(-chip / 2 - pin, off - R * 0.05); ctx.lineTo(-chip / 2, off - R * 0.05);
      ctx.moveTo(chip / 2, off - R * 0.05); ctx.lineTo(chip / 2 + pin, off - R * 0.05);
      ctx.stroke();
    }

    // Padlock shackle
    const pw = chip * 0.6;
    const py = -R * 0.02;
    ctx.beginPath();
    ctx.arc(0, py - chip * 0.28, pw / 2, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "rgba(115,224,190,0.9)";
    ctx.fillRect(-pw / 2, py - chip * 0.28, pw, pw * 0.7);
    ctx.fillStyle = "#080D12";
    ctx.beginPath();
    ctx.arc(0, py - chip * 0.28 + pw * 0.3, pw * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    raf = requestAnimationFrame(draw);
  };

  raf = requestAnimationFrame(draw);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
  };
}
