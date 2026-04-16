import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.join(__dirname, "episode-topic-map.json");

interface Entry {
  slug: string;
  title: string;
  guest?: string;
  relevance: string;
}

describe("episode-topic-map.json", () => {
  const raw = fs.readFileSync(mapPath, "utf-8");
  const json = JSON.parse(raw) as Record<string, unknown>;

  it("has a _meta section documenting the file", () => {
    expect(json._meta).toBeTypeOf("object");
    const meta = json._meta as Record<string, unknown>;
    expect(typeof meta.description).toBe("string");
    expect(typeof meta.generatedAt).toBe("string");
  });

  const TOPICS = ["endurance", "nutrition", "strength", "recovery", "culture"];

  it("contains all five Ted topics", () => {
    for (const t of TOPICS) {
      expect(Array.isArray(json[t]), `missing topic ${t}`).toBe(true);
    }
  });

  it("every entry has a slug, title, and relevance", () => {
    for (const t of TOPICS) {
      const entries = json[t] as Entry[];
      for (const e of entries) {
        expect(e.slug, `${t} entry missing slug`).toBeTruthy();
        expect(e.title, `${t} entry missing title`).toBeTruthy();
        expect(e.relevance, `${t} entry missing relevance`).toBeTruthy();
        // slug shouldn't include spaces
        expect(/\s/.test(e.slug), `${t}.${e.slug} slug has whitespace`).toBe(false);
      }
    }
  });

  it("total entries across topics is reasonable", () => {
    let total = 0;
    for (const t of TOPICS) {
      total += (json[t] as Entry[]).length;
    }
    // At least 10 entries total, otherwise surfacing is starved
    expect(total).toBeGreaterThanOrEqual(10);
  });

  it("no entry contains banned phrases in the relevance blurb", () => {
    const banned = ["unlock", "game-changer", "game changer", "ecosystem", "tapestry"];
    for (const t of TOPICS) {
      for (const e of json[t] as Entry[]) {
        const lower = e.relevance.toLowerCase();
        for (const b of banned) {
          expect(lower.includes(b), `${e.slug} relevance contains "${b}"`).toBe(false);
        }
      }
    }
  });
});
