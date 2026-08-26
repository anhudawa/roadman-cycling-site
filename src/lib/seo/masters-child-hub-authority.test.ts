import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getClusterHubByPath } from "@/lib/cluster-hubs";
import { LLMS_PINNED_BLOG_SLUGS } from "./llms-content";
import { SEARCH_OWNER_BY_ID } from "./search-ownership";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const hubSource = read("src/lib/cluster-hubs.ts");
const vo2Start = hubSource.indexOf("const MASTERS_VO2MAX");
const vo2End = hubSource.indexOf("const ZONE_2", vo2Start);
const vo2Source = hubSource.slice(vo2Start, vo2End);
const nutritionStart = hubSource.indexOf("const MASTERS_NUTRITION");
const nutritionEnd = hubSource.indexOf("const INDOOR", nutritionStart);
const nutritionSource = hubSource.slice(nutritionStart, nutritionEnd);
const vo2Article = read(
  "content/blog/vo2max-decline-reversibility-masters-cyclists.mdx",
);
const nutritionArticle = read(
  "content/blog/masters-metabolism-anabolic-resistance-nutrition.mdx",
);

describe("masters VO2max and nutrition child-hub authority", () => {
  it("preserves both indexed URLs from exact GSC page evidence", () => {
    const decision = read(
      "docs/seo/gsc-masters-vo2max-nutrition-authority-2026-08-26.md",
    );

    expect(decision).toContain(
      "| `/masters/vo2max` | 2 | 69 | 2.9% | 5.6 |",
    );
    expect(decision).toContain(
      "| `/nutrition/masters` | 2 | 141 | 1.4% | 16.1 |",
    );
    expect(decision).toContain("Preserve both established URLs");
    expect(decision).toContain("Do not redirect either URL");
    expect(decision).toContain("URL is on Google");
  });

  it("assigns distinct supporting jobs below the masters owner", () => {
    const owner = SEARCH_OWNER_BY_ID.get("masters-cycling");

    expect(owner?.path).toBe("/masters");
    expect(owner?.supportingDestinations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/masters/vo2max",
          intent: expect.stringContaining("measurement audit"),
        }),
        expect.objectContaining({
          path: "/nutrition/masters",
          intent: expect.stringContaining("Energy, carbohydrate, protein"),
        }),
      ]),
    );
  });

  it("publishes concise metadata, visible review and scoped research", () => {
    const vo2 = getClusterHubByPath("/masters/vo2max");
    const nutrition = getClusterHubByPath("/nutrition/masters");

    for (const hub of [vo2, nutrition]) {
      expect(hub).toBeDefined();
      expect(hub?.metaTitle.length).toBeLessThanOrEqual(60);
      expect(hub?.description.length).toBeGreaterThanOrEqual(120);
      expect(hub?.description.length).toBeLessThanOrEqual(160);
      expect(hub?.reviewedBy).toBe("Anthony Walsh");
      expect(hub?.lastReviewed).toBe("2026-08-26");
      expect(hub?.research?.length).toBeGreaterThanOrEqual(5);
      expect(hub?.research?.every((source) => source.scope.length > 60)).toBe(
        true,
      );
      expect(hub?.faqs.length).toBeGreaterThanOrEqual(6);
    }
  });

  it("replaces fixed VO2max rules with a four-step decision framework", () => {
    for (const staleClaim of [
      "VO2max is the first thing to go after 40",
      "declines roughly 0.5% a year",
      "two hard sessions with 72 hours between them",
      "Classic 5×5",
      "two or three times a week are the highest-return work",
    ]) {
      expect(vo2Source).not.toContain(staleClaim);
    }

    for (const boundary of [
      "Step one: verify the signal",
      "Step two: define the job before choosing the interval",
      "Step three: start with the smallest repeatable dose",
      "Step four: earn the next hard session",
      "No trial gives every cyclist over 40 a compulsory 72-hour clock",
      "When this stops being a training question",
    ]) {
      expect(vo2Source).toContain(boundary);
    }

    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/2361923/",
      "https://pubmed.ncbi.nlm.nih.gov/11581561/",
      "https://pubmed.ncbi.nlm.nih.gov/11844000/",
      "https://pubmed.ncbi.nlm.nih.gov/36972981/",
      "https://pubmed.ncbi.nlm.nih.gov/36078762/",
    ]) {
      expect(vo2Source).toContain(url);
      expect(vo2Article).toContain(url);
    }
  });

  it("replaces universal nutrition prescriptions with a bounded audit", () => {
    for (const staleClaim of [
      "protein needs rise to 1.6–2.2 g/kg/day",
      "masters cyclists do better at 1.6 to 2.2 g/kg/day",
      "one of the highest-value habits available",
      "For a 50-year-old it's actively harmful",
      "and the leanness follows",
    ]) {
      expect(nutritionSource).not.toContain(staleClaim);
    }

    for (const boundary of [
      "Start with energy, not a supplement",
      "What “anabolic resistance” can—and cannot—tell a cyclist",
      "A four-part masters nutrition audit",
      "masters-specific research does not establish one universal daily target",
      "The Roadman boundary",
    ]) {
      expect(nutritionSource).toContain(boundary);
    }

    for (const url of [
      "https://pubmed.ncbi.nlm.nih.gov/39940356/",
      "https://pubmed.ncbi.nlm.nih.gov/25056502/",
      "https://pubmed.ncbi.nlm.nih.gov/28318687/",
      "https://pubmed.ncbi.nlm.nih.gov/28855419/",
      "https://bjsm.bmj.com/content/57/17/1073",
      "https://pubmed.ncbi.nlm.nih.gov/31581498/",
    ]) {
      expect(nutritionSource).toContain(url);
      expect(nutritionArticle).toContain(url);
    }
  });

  it("rebuilds the featured research articles to match the hub boundaries", () => {
    for (const article of [vo2Article, nutritionArticle]) {
      const parsed = matter(article);
      expect(parsed.data.updatedDate).toBe("2026-08-26");
      expect(parsed.data.lastReviewed).toBe("2026-08-26");
      expect(parsed.data.reviewedBy).toContain("Anthony Walsh");
      expect(parsed.data.primaryHub).toBe("masters-cycling");
      expect(parsed.data.citedClaims.length).toBeGreaterThanOrEqual(4);
      expect(parsed.data.faq.length).toBeGreaterThanOrEqual(6);
      expect(parsed.content).toContain("Primary sources and review boundary");
      for (const claim of parsed.data.citedClaims) {
        expect(["strong", "moderate", "emerging", "anecdotal"]).toContain(
          claim.evidenceLevel,
        );
      }
    }

    for (const staleClaim of [
      "The gap between them isn't genetics or luck",
      "Keep two genuine high-intensity sessions in the week",
      "a full 72 hours before the next hard day",
      "the thing that's least pleasant to train",
      "the decline roughly halves",
    ]) {
      expect(vo2Article).not.toContain(staleClaim);
    }

    for (const staleClaim of [
      "it rewrites the nutrition rules after 40",
      "masters cyclists do better at **1.6 to 2.2 g/kg/day**",
      "Four feedings of 30–40g beat",
      "the one the masters metabolism needs most",
      "resistance work becomes non-negotiable",
      "the fat takes care of itself",
    ]) {
      expect(nutritionArticle).not.toContain(staleClaim);
    }

    expect(vo2Article).toContain(
      "There is no validated annual VO2max decline rate for one masters cyclist",
    );
    expect(nutritionArticle).toContain(
      "masters-athlete studies are too sparse and heterogeneous",
    );
  });

  it("emits review and citation trust in the shared hub template", () => {
    const page = read("src/components/features/hubs/ClusterHubPage.tsx");

    expect(page).toContain("dateModified: hub.lastReviewed");
    expect(page).toContain('hub.reviewedBy === "Anthony Walsh"');
    expect(page).toContain('{ "@id": ENTITY_IDS.person }');
    expect(page).toContain("citation: hub.research.map");
    expect(page).toContain("research={hub.research?.map");
    expect(page).toContain("reviewedBy={hub.reviewedBy}");
    expect(page).toContain("lastReviewed={hub.lastReviewed}");
  });

  it("aligns AI discovery, recurring submission and benchmark prompts", () => {
    const shortDiscovery = read("src/app/llms.txt/route.ts");
    const fullDiscovery = read("src/app/llms-full.txt/route.ts");
    const indexNow = read("scripts/submit-indexnow.ts");

    for (const discovery of [shortDiscovery, fullDiscovery]) {
      expect(discovery).toContain("/masters/vo2max");
      expect(discovery).toContain("/nutrition/masters");
      expect(discovery).toContain("no universal protein target");
      expect(discovery).toContain("72-hour rule");
    }

    expect(indexNow).toContain("`https://${HOST}/masters/vo2max`");
    expect(indexNow).toContain("`https://${HOST}/nutrition/masters`");
    for (const slug of [
      "vo2max-decline-reversibility-masters-cyclists",
      "masters-metabolism-anabolic-resistance-nutrition",
    ]) {
      expect(LLMS_PINNED_BLOG_SLUGS.has(slug)).toBe(true);
      expect(indexNow).toContain(`\`https://\${HOST}/blog/${slug}\``);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 310, target_page: "/masters/vo2max" }),
        expect.objectContaining({ id: 311, target_page: "/nutrition/masters" }),
      ]),
    );
  });
});
