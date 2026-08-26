import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("blog GFM table rendering", () => {
  it("enables remark-gfm in the canonical blog renderer", () => {
    const page = read("src/app/(content)/blog/[slug]/page.tsx");

    expect(page).toContain('import remarkGfm from "remark-gfm"');
    expect(page).toContain("remarkPlugins: [remarkGfm]");
  });

  it("turns a Markdown table into semantic table elements", async () => {
    const compiled = String(
      await compile("| Question | Answer |\n| --- | --- |\n| Does it work? | Yes |", {
        remarkPlugins: [remarkGfm],
      }),
    );

    expect(compiled).toContain("_components.table");
    expect(compiled).toContain("_components.thead");
    expect(compiled).toContain("_components.th");
    expect(compiled).toContain("_components.td");
  });

  it("protects the sitewide table corpus rather than one article", () => {
    const blogDir = resolve(process.cwd(), "content/blog");
    const tableArticles = readdirSync(blogDir).filter((filename) => {
      if (!filename.endsWith(".mdx")) return false;
      return /^\|.+\|$/m.test(readFileSync(resolve(blogDir, filename), "utf8"));
    });

    expect(tableArticles.length).toBeGreaterThanOrEqual(160);
  });
});
