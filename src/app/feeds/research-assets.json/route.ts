import { NextResponse } from "next/server";
import { getResearchAssetCatalog } from "@/data/research-assets";
import { FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

export function GET() {
  return NextResponse.json(
    {
      schemaVersion: 1,
      canonicalPage: feedUrl("/research"),
      feedUrl: feedUrl("/feeds/research-assets.json"),
      editorialPolicy: feedUrl("/editorial-standards"),
      definition:
        "A typed catalogue of Roadman Cycling datasets, archive studies, coaching frameworks and evidence benchmarks. The kind field defines what each asset can and cannot support.",
      assets: getResearchAssetCatalog(),
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
