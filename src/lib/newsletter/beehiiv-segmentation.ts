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
 * multiple operational lists. App hero and footer captures therefore retain
 * their source tag and also share the permanent `app-waitlist` tag/campaign.
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
      ...(sourceTag ? [sourceTag] : []),
    ]),
  );

  return {
    tags,
    campaign:
      assetCampaign ?? (isAppWaitlist ? APP_WAITLIST_TAG : "saturday-spin"),
  };
}
