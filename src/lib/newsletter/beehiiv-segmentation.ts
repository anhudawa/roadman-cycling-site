export const APP_WAITLIST_TAG = "app-waitlist";

const APP_WAITLIST_SOURCE_PREFIX = "roadman-app-waitlist-";

interface NewsletterSegmentationOptions {
  source: string;
  assetTags?: readonly string[];
  assetCampaign?: string;
}

export interface NewsletterBeehiivSegmentation {
  tags: string[];
  campaign: string;
}

/**
 * Keep acquisition-position attribution without splitting one funnel into
 * multiple operational lists. App hero and footer captures share only the
 * permanent `app-waitlist` tag/campaign; their exact source remains available
 * through the UTM medium passed by the newsletter route.
 */
export function buildNewsletterBeehiivSegmentation({
  source,
  assetTags = [],
  assetCampaign,
}: NewsletterSegmentationOptions): NewsletterBeehiivSegmentation {
  const sourceTag = source.replace(/^\/+/, "").trim();
  const isAppWaitlist = source.startsWith(APP_WAITLIST_SOURCE_PREFIX);
  const tags = Array.from(
    new Set([
      "saturday-spin",
      ...assetTags,
      ...(isAppWaitlist ? [APP_WAITLIST_TAG] : []),
      ...(!isAppWaitlist && sourceTag ? [sourceTag] : []),
    ]),
  );

  return {
    tags,
    campaign:
      assetCampaign ?? (isAppWaitlist ? APP_WAITLIST_TAG : "saturday-spin"),
  };
}
