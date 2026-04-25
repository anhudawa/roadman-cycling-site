import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
  FAQPageJsonLd,
  OrganizationJsonLd,
  PodcastEpisodeJsonLd,
} from "./JsonLd";

function extractJsonLd(html: string): Record<string, unknown> {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("No JSON-LD script tag found in rendered HTML");
  return JSON.parse(match[1]) as Record<string, unknown>;
}

describe("OrganizationJsonLd", () => {
  it("renders a @graph with 4 entities", () => {
    const html = renderToStaticMarkup(<OrganizationJsonLd />);
    const data = extractJsonLd(html);
    expect(data["@context"]).toBe("https://schema.org");
    const graph = data["@graph"] as unknown[];
    expect(graph).toHaveLength(4);
  });

  it("includes Organization, WebSite, Person, and PodcastSeries types", () => {
    const html = renderToStaticMarkup(<OrganizationJsonLd />);
    const data = extractJsonLd(html);
    const types = (data["@graph"] as Array<Record<string, unknown>>).map(
      (e) => e["@type"],
    );
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).toContain("Person");
    expect(types).toContain("PodcastSeries");
  });

  it("Organization entity references the Person by @id", () => {
    const html = renderToStaticMarkup(<OrganizationJsonLd />);
    const data = extractJsonLd(html);
    const org = (data["@graph"] as Array<Record<string, unknown>>).find(
      (e) => e["@type"] === "Organization",
    );
    expect(org?.founder).toHaveProperty("@id");
  });
});

describe("ArticleJsonLd", () => {
  const PROPS = {
    title: "How to Build a Base Phase",
    description: "Everything you need to know about base training.",
    url: "https://roadmancycling.com/blog/base-phase",
    datePublished: "2026-01-10",
    dateModified: "2026-03-01",
    category: "Training",
  };

  it("emits @type Article", () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data["@type"]).toBe("Article");
  });

  it("includes headline and description", () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.headline).toBe(PROPS.title);
    expect(data.description).toBe(PROPS.description);
  });

  it("includes datePublished and dateModified", () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.datePublished).toBe("2026-01-10");
    expect(data.dateModified).toBe("2026-03-01");
  });

  it("references author and publisher by @id", () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(
      (data.author as Record<string, unknown>)["@id"],
    ).toBeTruthy();
    expect(
      (data.publisher as Record<string, unknown>)["@id"],
    ).toBeTruthy();
  });

  it("omits dateModified when not provided", () => {
    const html = renderToStaticMarkup(
      <ArticleJsonLd {...PROPS} dateModified={undefined} />,
    );
    const data = extractJsonLd(html);
    expect(data.dateModified).toBeUndefined();
  });
});

describe("FAQPageJsonLd", () => {
  const QUESTIONS = [
    { question: "What is FTP?", answer: "Functional Threshold Power." },
    { question: "How do I train zone 2?", answer: "Keep HR below 75% max." },
  ];

  it("emits @type FAQPage", () => {
    const html = renderToStaticMarkup(<FAQPageJsonLd questions={QUESTIONS} />);
    const data = extractJsonLd(html);
    expect(data["@type"]).toBe("FAQPage");
  });

  it("maps each question to a Question/Answer pair", () => {
    const html = renderToStaticMarkup(<FAQPageJsonLd questions={QUESTIONS} />);
    const data = extractJsonLd(html);
    const entities = data.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]["@type"]).toBe("Question");
    expect(entities[0].name).toBe("What is FTP?");
    expect(
      (entities[0].acceptedAnswer as Record<string, unknown>).text,
    ).toBe("Functional Threshold Power.");
  });

  it("renders nothing when questions array is empty", () => {
    const html = renderToStaticMarkup(<FAQPageJsonLd questions={[]} />);
    expect(html).toBe("");
  });
});

describe("BreadcrumbJsonLd", () => {
  const ITEMS = [
    { name: "Home", url: "https://roadmancycling.com" },
    { name: "Blog", url: "https://roadmancycling.com/blog" },
    { name: "FTP Guide", url: "https://roadmancycling.com/blog/ftp-guide" },
  ];

  it("emits @type BreadcrumbList", () => {
    const html = renderToStaticMarkup(<BreadcrumbJsonLd items={ITEMS} />);
    const data = extractJsonLd(html);
    expect(data["@type"]).toBe("BreadcrumbList");
  });

  it("assigns 1-indexed positions to each item", () => {
    const html = renderToStaticMarkup(<BreadcrumbJsonLd items={ITEMS} />);
    const data = extractJsonLd(html);
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list[0].position).toBe(1);
    expect(list[1].position).toBe(2);
    expect(list[2].position).toBe(3);
  });

  it("includes name and item URL for each breadcrumb", () => {
    const html = renderToStaticMarkup(<BreadcrumbJsonLd items={ITEMS} />);
    const data = extractJsonLd(html);
    const list = data.itemListElement as Array<Record<string, unknown>>;
    expect(list[2].name).toBe("FTP Guide");
    expect(list[2].item).toBe(
      "https://roadmancycling.com/blog/ftp-guide",
    );
  });
});

describe("PodcastEpisodeJsonLd", () => {
  const PROPS = {
    title: "Breaking Through Your Plateau",
    description: "We talk about FTP stagnation with Dr. Wakefield.",
    url: "https://roadmancycling.com/podcast/ep-2200",
    datePublished: "2026-04-01",
    duration: "PT45M",
    episodeNumber: 2200,
  };

  it("emits @type PodcastEpisode", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data["@type"]).toBe("PodcastEpisode");
  });

  it("includes name, description, url, and datePublished", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.name).toBe(PROPS.title);
    expect(data.description).toBe(PROPS.description);
    expect(data.url).toBe(PROPS.url);
    expect(data.datePublished).toBe("2026-04-01");
  });

  it("includes duration when provided", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.timeRequired).toBe("PT45M");
  });

  it("includes episodeNumber when provided", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(data.episodeNumber).toBe(2200);
  });

  it("links back to the podcast series by @id", () => {
    const html = renderToStaticMarkup(<PodcastEpisodeJsonLd {...PROPS} />);
    const data = extractJsonLd(html);
    expect(
      (data.partOfSeries as Record<string, unknown>)["@id"],
    ).toBeTruthy();
  });
});
