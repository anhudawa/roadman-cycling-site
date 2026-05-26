import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import {
  resolveSpeaker,
  scanTranscriptForEntities,
  slugify,
  TOPIC_VOCAB,
  CANONICAL_NAMES,
} from "../../agents/transcript-indexer/src/lib/canonical";
import { MockLLMClient } from "../../agents/transcript-indexer/src/lib/llm";
import {
  extractFromEpisode,
  type ExtractionInput,
} from "../../agents/transcript-indexer/src/steps/extract-claims";

const PROMPTS_DIR = fileURLToPath(
  new URL("../../agents/transcript-indexer/prompts", import.meta.url)
);

describe("canonical mapping", () => {
  it("reconciles a surname-only mention to the canonical entity", () => {
    const r = resolveSpeaker("Seiler");
    expect(r.entitySlug).toBe("stephen-seiler");
    expect(r.canonicalName).toBe("Professor Stephen Seiler");
  });

  it("passes through an unknown speaker unchanged, with no entity slug", () => {
    const r = resolveSpeaker("Some Amateur Rider");
    expect(r.entitySlug).toBeUndefined();
    expect(r.canonicalName).toBe("Some Amateur Rider");
  });

  it("returns an empty canonical name for a null speaker", () => {
    expect(resolveSpeaker(null).canonicalName).toBe("");
  });

  it("slugifies to kebab-case, stripping punctuation and diacritics", () => {
    expect(slugify("Zone 2 Endurance Training!")).toBe(
      "zone-2-endurance-training"
    );
    expect(slugify("André Greipel")).toBe("andre-greipel");
  });

  it("counts every surface form when scanning a transcript for entities", () => {
    const hits = scanTranscriptForEntities(
      "Dan Lorang coached the team. Lorang knows threshold work."
    );
    expect(hits.get("dan-lorang")?.count).toBe(2);
  });

  it("exposes a controlled vocabulary and canonical name list", () => {
    expect(TOPIC_VOCAB).toContain("Zone 2 endurance training");
    expect(CANONICAL_NAMES).toContain("Professor Stephen Seiler");
  });
});

// A canned model response that exercises every reconciliation branch:
// canonical speaker, evidence fallback, confidence clamping, timestamp
// passthrough, a quote with no speaker (must be dropped), and topic tags.
const cannedResponse = JSON.stringify({
  claims: [
    {
      claim: "Seiler recommends 80/20 polarised intensity distribution.",
      confidence: 1.5, // out of range -> clamp to 1
      evidence: "study",
      claimType: "recommendation",
      speaker: "Seiler", // surname -> canonical
      supportingQuote: "Eighty percent of your training should be easy.",
      timestamp: "12:34",
      topicTags: ["Zone 2 endurance training"],
    },
    {
      claim: "Most amateurs train too hard on easy days.",
      // confidence missing -> default 0.5
      evidence: "made-up-level", // invalid -> falls back to "opinion"
      claimType: "opinion",
      speaker: "Guest",
      supportingQuote: null,
      // timestamp omitted -> null
      topicTags: [],
    },
  ],
  quotes: [
    {
      quote:
        "If you want to ride faster for longer, you have to slow down most of your easy rides and stop chasing every segment.",
      speaker: "Seiler",
      // speakerCredential omitted -> defaults to the entity title
      context: "Explaining intensity discipline.",
      timestamp: "01:02",
      topicTags: ["polarised training"],
    },
    {
      // no speaker -> must be filtered out
      quote: "This quote has no attributable speaker so it should be dropped.",
      context: "Orphan line.",
    },
  ],
  topicTags: [
    { tag: "Prof Seiler", kind: "entity", relevance: 0.9 },
    { tag: "Zone 2 endurance training", kind: "topic", relevance: 0.7 },
  ],
});

const input: ExtractionInput = {
  slug: "ep-test-seiler-polarised",
  title: "Polarised training with Professor Seiler",
  guest: "Professor Stephen Seiler",
  // Mentions Dan Lorang, whom the model did NOT tag — the deterministic
  // transcript scan should still surface him as an entity tag.
  transcript:
    "Anthony talks with Seiler about polarised training. Dan Lorang is referenced as a counterpoint on threshold work, and the discussion turns to zone two riding.",
};

describe("extractFromEpisode", () => {
  it("validates, reconciles, and structures a model extraction", async () => {
    const llm = new MockLLMClient(() => cannedResponse);
    const result = await extractFromEpisode(input, llm, {
      promptsDir: PROMPTS_DIR,
    });

    expect(result.claims).toHaveLength(2);

    const [c1, c2] = result.claims;
    // canonical speaker reconciliation + confidence clamp + timestamp
    expect(c1.speaker).toBe("Professor Stephen Seiler");
    expect(c1.speakerEntitySlug).toBe("stephen-seiler");
    expect(c1.confidence).toBe(1);
    expect(c1.evidence).toBe("study");
    expect(c1.timestamp).toBe("12:34");
    expect(c1.topicTags).toContain("zone-2-endurance-training");

    // defaults + invalid-evidence fallback + null timestamp
    expect(c2.confidence).toBe(0.5);
    expect(c2.evidence).toBe("opinion");
    expect(c2.timestamp).toBeNull();
  });

  it("drops quotes without a speaker and enriches the rest", async () => {
    const llm = new MockLLMClient(() => cannedResponse);
    const result = await extractFromEpisode(input, llm, {
      promptsDir: PROMPTS_DIR,
    });

    // Orphan quote (no speaker) is filtered out.
    expect(result.quotes).toHaveLength(1);
    const q = result.quotes[0];
    expect(q.speaker).toBe("Professor Stephen Seiler");
    expect(q.speakerEntitySlug).toBe("stephen-seiler");
    expect(q.timestamp).toBe("01:02");
    expect(q.wordCount).toBeGreaterThan(0);
    // credential falls back to the canonical entity's title
    expect(q.speakerCredential).toContain("Professor of Sport Science");
  });

  it("backstops model tags with a deterministic transcript entity scan", async () => {
    const llm = new MockLLMClient(() => cannedResponse);
    const result = await extractFromEpisode(input, llm, {
      promptsDir: PROMPTS_DIR,
    });

    const slugs = result.topicTags.map((t) => t.slug);
    // From the model:
    expect(slugs).toContain("stephen-seiler"); // "Prof Seiler" -> canonical entity
    expect(slugs).toContain("zone-2-endurance-training"); // topic
    // From the transcript scan (model never tagged Lorang):
    expect(slugs).toContain("dan-lorang");

    const lorang = result.topicTags.find((t) => t.slug === "dan-lorang");
    expect(lorang?.kind).toBe("entity");
    expect(lorang?.entitySlug).toBe("dan-lorang");
  });
});
