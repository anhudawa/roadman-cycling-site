import { NextResponse } from "next/server";
import { FEED_CACHE_HEADERS } from "@/lib/feeds";
import {
  PODCAST_ARCHIVE_BY_YEAR,
  PODCAST_ARCHIVE_FORMATS,
  PODCAST_ARCHIVE_PILLARS,
  PODCAST_ARCHIVE_REPORT,
} from "@/data/podcast-archive-study";

export function GET() {
  return NextResponse.json(
    {
      schemaVersion: 1,
      report: PODCAST_ARCHIVE_REPORT,
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      attribution:
        "Roadman Cycling Podcast Archive Study 2026 — https://roadmancycling.com/research/cycling-podcast-archive-study",
      methodology: {
        population:
          "One MDX record for each searchable Roadman Cycling Podcast episode page in the repository snapshot dated 2026-08-31.",
        counting:
          "Publication year uses publishDate; editorial topic uses pillar; format uses type; transcript and media counts record field or matching-file presence.",
        limitations: [
          "This is one publisher's searchable on-site archive, not the complete historic RSS feed or global cycling-podcast market.",
          "The dataset contains no downloads, listening time, completion rates, search demand or audience demographics.",
          "Editorial classifications and guest-name aliases can change after review.",
          "Transcript presence does not measure transcription accuracy.",
        ],
      },
      pillars: PODCAST_ARCHIVE_PILLARS,
      formats: PODCAST_ARCHIVE_FORMATS,
      byYear: PODCAST_ARCHIVE_BY_YEAR,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
