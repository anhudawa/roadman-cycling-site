import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

function readArticle(slug: string) {
  const raw = readFileSync(
    resolve(process.cwd(), `content/blog/${slug}.mdx`),
    "utf8",
  );
  const parsed = matter(raw);

  return { raw, data: parsed.data, content: parsed.content };
}

describe("priority search article evidence contracts", () => {
  it("keeps the 60-day training result distinct from general guidance", () => {
    const article = readArticle("how-pro-cyclist-trains-60-days");

    expect(article.data.updatedDate).toBe("2026-08-25");
    expect(article.data.answerCapsule).toContain("That result is not a forecast");
    expect(article.data.citedClaims).toHaveLength(4);
    expect(
      article.data.citedClaims.map(
        (claim: { evidenceLevel: string }) => claim.evidenceLevel,
      ),
    ).toEqual(["anecdotal", "moderate", "strong", "moderate"]);
    expect(article.content).toContain("Stöggl and Sperlich, 2014");
    expect(article.content).toContain("pubmed.ncbi.nlm.nih.gov/21660838");
    expect(article.raw).not.toContain("You'll gain roughly 15-20 watts");
    expect(article.raw).not.toContain("90g carbs per hour during hard sessions");
  });

  it("keeps masters age, licence and performance guidance jurisdiction-specific", () => {
    const article = readArticle(
      "cycling-masters-racing-getting-started-guide",
    );

    expect(article.data.updatedDate).toBe("2026-08-25");
    expect(article.data.answerCapsule).toContain("British Cycling");
    expect(article.data.answerCapsule).toContain("USA Cycling");
    expect(article.data.answerCapsule).toContain("Cycling Ireland");
    expect(article.data.citedClaims).toHaveLength(4);
    expect(article.content).toContain(
      "britishcycling.org.uk/road/article/roadst_Road-Categories_Classifications",
    );
    expect(article.content).toContain("2026-Masters-Junior-Road-Eligibility.pdf");
    expect(article.content).toContain("Rules2026E33F1.pdf");
    expect(article.raw).not.toContain(
      "define masters as **40 and over**",
    );
    expect(article.raw).not.toContain(
      "Your age on January 1st of the racing year determines your category",
    );
    expect(article.raw).not.toContain(
      "**3.0 w/kg FTP** puts you in the middle",
    );
    expect(article.raw).not.toContain("Buy a day licence at the event");
  });
});
