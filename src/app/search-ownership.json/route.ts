import { NextResponse } from "next/server";
import { FEED_CACHE_HEADERS } from "@/lib/feeds";
import { serialiseSearchOwners } from "@/lib/seo/search-ownership";

export function GET() {
  const owners = serialiseSearchOwners();
  return NextResponse.json(
    {
      schemaVersion: 1,
      principle:
        "One broad query family has one canonical owner; supporting pages target narrower questions and link to that owner.",
      count: owners.length,
      owners,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
