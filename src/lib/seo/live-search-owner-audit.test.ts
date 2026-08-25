import { describe, expect, it } from "vitest";
import { auditOwnerDocument, parseJsonLdRoots } from "./live-search-owner-audit";

function ownerHtml(route: "/training-plans", breadcrumbs = 1) {
  const url = `https://roadmancycling.com${route}`;
  const breadcrumbScripts = Array.from({ length: breadcrumbs }, () =>
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
    })}</script>`,
  ).join("");
  const owner = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    dateModified: "2026-08-25",
    author: { "@id": "https://roadmancycling.com/author/anthony-walsh#person" },
    reviewedBy: { "@id": "https://roadmancycling.com/#organization" },
    isPartOf: { "@id": "https://roadmancycling.com/#website" },
    relatedLink: [
      "https://roadmancycling.com/plan",
      "https://roadmancycling.com/topics/cycling-training-plans",
    ],
  };

  return [
    `<title>Cycling Training Plans</title>`,
    `<link rel="canonical" href="${url}">`,
    breadcrumbScripts,
    `<script type="application/ld+json">${JSON.stringify(owner)}</script>`,
    `<aside aria-label="Sources, author, and editorial standards">`,
    `Reviewed by Roadman Cycling coaching team · Last reviewed 25 August 2026`,
    `</aside>`,
  ].join("");
}

describe("live priority-owner audit", () => {
  it("accepts one complete canonical owner graph", () => {
    expect(auditOwnerDocument("/training-plans", ownerHtml("/training-plans")).errors)
      .toEqual([]);
  });

  it("rejects duplicate breadcrumb graphs", () => {
    expect(
      auditOwnerDocument(
        "/training-plans",
        ownerHtml("/training-plans", 2),
      ).errors,
    ).toContain("/training-plans: expected one BreadcrumbList, got 2");
  });

  it("flattens top-level JSON-LD arrays used by the root entity graph", () => {
    const html = `<script type="application/ld+json">${JSON.stringify([
      { "@type": "Organization", "@id": "#organization" },
      { "@type": "WebSite", "@id": "#website" },
    ])}</script>`;

    expect(parseJsonLdRoots(html).map((node) => node["@type"])).toEqual([
      "Organization",
      "WebSite",
    ]);
  });
});
