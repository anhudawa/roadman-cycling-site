import podcastHubIndex from "@/generated/podcast-hub-index.json";
import type { ContentPillar, EpisodeType } from "@/types";

export interface PodcastHubIndexItem {
  slug: string;
  title: string;
  episodeNumber: number;
  guest?: string;
  guestCredential?: string;
  description: string;
  publishDate: string;
  duration: string;
  pillar: ContentPillar;
  type: EpisodeType;
}

/**
 * Return the build-generated, transcript-free archive index used by the
 * podcast hub. Parsing the full episode frontmatter at request time also
 * parses embedded transcripts and made cold hub responses take several
 * seconds. Production builds regenerate this file before Next compiles.
 */
export function getPodcastHubIndex(): PodcastHubIndexItem[] {
  return (podcastHubIndex as PodcastHubIndexItem[]).slice();
}
