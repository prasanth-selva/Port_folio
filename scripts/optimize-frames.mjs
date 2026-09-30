/**
 * Converts raw hero PNG frames (hero/ezgif-frame-*.png) into a lean WebP
 * sequence under public/sequence/ plus a manifest.json.
 *
 * Usage: node scripts/optimize-frames.mjs [--width 1280] [--quality 78]
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
const QUALITY = argVal("--quality", 78);

const SRC = path.resolve("hero");
const OUT = path.resolve("public/sequence");
const PREFIX = "core_";
const SUFFIX = "_delay-0.04s.webp";

fs.mkdirSync(OUT, { recursive: true });

const files = fs
  .readdirSync(SRC)
  .filter((f) => /^ezgif-frame-\d+\.png$/i.test(f))
  .sort();

if (files.length === 0) {
  console.error("No hero/ezgif-frame-*.png files found. Place raw frames in ./hero first.");
  process.exit(1);
}

console.log(`Optimizing ${files.length} frames -> ${WIDTH}px WebP q${QUALITY} ...`);

let totalIn = 0;
let totalOut = 0;
let i = 1;
for (const f of files) {
  const src = path.join(SRC, f);
  const dest = path.join(OUT, `${PREFIX}${String(i).padStart(3, "0")}${SUFFIX}`);
  const meta = await sharp(src).metadata();
  const pipeline = sharp(src).resize({
    width: Math.min(WIDTH, meta.width ?? WIDTH),
    withoutEnlargement: true,
  });
  const info = await pipeline.webp({ quality: QUALITY, effort: 4 }).toFile(dest);
  totalIn += fs.statSync(src).size;
  totalOut += info.size;
  i++;
}

const manifest = {
  prefix: `/sequence/${PREFIX}`,
  suffix: SUFFIX,
  count: files.length,
  pad: 3,
  width: WIDTH,
  generatedAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(
  `Done. ${(totalIn / 1048576).toFixed(1)} MB PNG -> ${(totalOut / 1048576).toFixed(1)} MB WebP ` +
    `(${(100 - (totalOut / totalIn) * 100).toFixed(0)}% smaller)`
);
