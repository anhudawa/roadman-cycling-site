import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getAllEpisodes } from "../src/lib/podcast";

const outputPath = resolve(
  process.cwd(),
  "src/generated/podcast-hub-index.json",
);

const index = getAllEpisodes().map((episode) => ({
  slug: episode.slug,
  title: episode.title,
  episodeNumber: episode.episodeNumber,
  guest: episode.guest,
  guestCredential: episode.guestCredential,
  description: episode.description,
  publishDate: episode.publishDate,
  duration: episode.duration,
  pillar: episode.pillar,
  type: episode.type,
}));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(index)}\n`, "utf8");

console.log(
  `[podcast:hub-index] wrote ${index.length} compact episode records to ${outputPath}`,
);
