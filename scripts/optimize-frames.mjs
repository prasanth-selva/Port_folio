/**
 * Converts raw hero PNG frames (hero/ezgif-frame-*.png) into lean WebP
 * sequences: a desktop set under public/sequence/ and a smaller mobile set
 * under public/sequence/mobile/, plus per-variant manifest.json files.
 *
 * Usage: node scripts/optimize-frames.mjs [--width 1280] [--mobile-width 560] [--quality 78]
 */
import "../src/env.mjs";

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const argVal = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};

const WIDTH = argVal("--width", 1280);
const MOBILE_WIDTH = argVal("--mobile-width", 560);
const QUALITY = argVal("--quality", 78);
const MOBILE_QUALITY = argVal("--mobile-quality", 70);

const SRC = path.resolve("hero");
const OUT = path.resolve("public/sequence");
const OUT_MOBILE = path.join(OUT, "mobile");
const PREFIX = "core_";
const SUFFIX = "_delay-0.04s.webp";

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(OUT_MOBILE, { recursive: true });

const files = fs
  .readdirSync(SRC)
  .filter((f) => /^ezgif-frame-\d+\.png$/i.test(f))
  .sort();

if (files.length === 0) {
  console.error("No hero/ezgif-frame-*.png files found. Place raw frames in ./hero first.");
  process.exit(1);
}

console.log(
  `Optimizing ${files.length} frames -> desktop ${WIDTH}px q${QUALITY} + mobile ${MOBILE_WIDTH}px q${MOBILE_QUALITY} ...`
);

let totalIn = 0;
let totalOut = 0;
let totalMobile = 0;
let i = 1;
for (const f of files) {
  const src = path.join(SRC, f);
  const meta = await sharp(src).metadata();
  const resize = (width) => ({
    width: Math.min(width, meta.width ?? width),
    withoutEnlargement: true,
  });

  const dest = path.join(OUT, `${PREFIX}${String(i).padStart(3, "0")}${SUFFIX}`);
  const info = await sharp(src).resize(resize(WIDTH)).webp({ quality: QUALITY, effort: 4 }).toFile(dest);

  const destMobile = path.join(OUT_MOBILE, `${PREFIX}${String(i).padStart(3, "0")}${SUFFIX}`);
  const infoMobile = await sharp(src).resize(resize(MOBILE_WIDTH)).webp({ quality: MOBILE_QUALITY, effort: 4 }).toFile(destMobile);

  totalIn += fs.statSync(src).size;
  totalOut += info.size;
  totalMobile += infoMobile.size;
  i++;
}

const writeManifest = (dir, width) => {
  const manifest = {
    prefix: `${path.relative("public", dir).startsWith("sequence") ? "/" + path.relative("public", dir) : "/sequence"}/core_`,
    suffix: SUFFIX,
    count: files.length,
    pad: 3,
    width,
    generatedAt: new Date().toISOString(),
  };
  // Normalize prefix (works for both sequence/ and sequence/mobile/)
  manifest.prefix = "/" + path.join(path.relative("public", dir), PREFIX);
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));
};
writeManifest(OUT, WIDTH);
writeManifest(OUT_MOBILE, MOBILE_WIDTH);

const mb = (n) => (n / 1048576).toFixed(1);
console.log(
  `Done. ${mb(totalIn)} MB PNG -> desktop ${mb(totalOut)} MB + mobile ${mb(totalMobile)} MB ` +
    `(desktop -${(100 - (totalOut / totalIn) * 100).toFixed(0)}%, mobile -${(100 - (totalMobile / totalIn) * 100).toFixed(0)}%)`
);
