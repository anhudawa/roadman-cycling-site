import { NextResponse } from "next/server";
import { FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";
import { getBenchmarkDataset } from "@/data/benchmarks";

export function GET() {
  return NextResponse.json(
    {
      schemaVersion: 1,
      canonicalPage: feedUrl("/benchmarks"),
      evidenceBase: feedUrl("/research"),
      editorialPolicy: feedUrl("/editorial-standards"),
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      dataset: getBenchmarkDataset(),
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
