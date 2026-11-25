// Batch-render every episode in words.json (bundles once, renders each).
// Usage:
//   npm run render:all                 → all episodes
//   npm run render:all -- lagom fika   → only these ids
//   npm run render:all -- --draft      → half resolution, fast check
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const draft = args.includes("--draft");
const only = args.filter((a) => !a.startsWith("--"));

const words = JSON.parse(readFileSync(path.join(root, "words.json"), "utf8"));
const compositionId = (id, episode) =>
  `ep${String(episode).padStart(2, "0")}-${id.replace(/[^a-zA-Z0-9-]/g, "-")}`;

const episodes = words.episodes
  .map((e, i) => ({ ...e, episode: e.episode ?? i + 1 }))
  .filter((e) => only.length === 0 || only.includes(e.id));

if (episodes.length === 0) {
  console.error(`No matching episodes for: ${only.join(", ")}`);
  process.exit(1);
}

console.log("Bundling…");
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  rspack: true,
});

mkdirSync(path.join(root, "out"), { recursive: true });

for (const ep of episodes) {
  const id = compositionId(ep.id, ep.episode);
  const composition = await selectComposition({ serveUrl, id });
  const outputLocation = path.join(
    root,
    "out",
    `${composition.defaultOutName ?? id}${draft ? "-draft" : ""}.mp4`,
  );
  console.log(`\n▶ ${id} → ${path.relative(root, outputLocation)}`);
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    scale: draft ? 0.5 : 1,
    crf: draft ? 28 : 18,
    imageFormat: "jpeg",
    jpegQuality: 92,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct % 10 === 0 && pct !== last) {
        last = pct;
        process.stdout.write(`${pct}% `);
      }
    },
  });
}
console.log("\n\nDone.");
