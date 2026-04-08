const BASE_URL = "https://api.beehiiv.com/v2";

function getHeaders(): HeadersInit {
  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey) {
    throw new Error("BEEHIIV_API_KEY is not set");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function getPublicationId(): string {
  const id = process.env.BEEHIIV_PUBLICATION_ID;
  if (!id) {
    throw new Error("BEEHIIV_PUBLICATION_ID is not set");
  }
  return id;
}

// ── Subscriber Stats ─────────────────────────────────────
export interface SubscriberStats {
  totalSubscribers: number;
  activeSubscribers: number;
}

export async function fetchSubscriberStats(): Promise<SubscriberStats | null> {
  try {
    const pubId = getPublicationId();
    const res = await fetch(`${BASE_URL}/publications/${pubId}`, {
      headers: getHeaders(),
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      console.error(
        `[Beehiiv] fetchSubscriberStats failed: ${res.status} ${res.statusText}`
      );
      return null;
    }

    const json = await res.json();
    const pub = json.data;

    return {
      totalSubscribers: pub.total_subscribers ?? 0,
      activeSubscribers: pub.active_subscribers ?? pub.total_subscribers ?? 0,
    };
  } catch (err) {
    console.error("[Beehiiv] fetchSubscriberStats error:", err);
    return null;
  }
}

// ── Subscriber Growth ────────────────────────────────────
export interface DailyGrowth {
  date: string;
  count: number;
}

export async function fetchSubscriberGrowth(
  days: number
): Promise<DailyGrowth[]> {
  try {
    const pubId = getPublicationId();
    const allSubscriptions: { created: number }[] = [];
    let page = 1;
    let hasMore = true;

    // Paginate through subscriptions
    while (hasMore) {
      const url = new URL(
        `${BASE_URL}/publications/${pubId}/subscriptions`
      );
      url.searchParams.set("limit", "100");
      url.searchParams.set("page", String(page));
      url.searchParams.set("expand[]", "stats");

      const res = await fetch(url.toString(), {
        headers: getHeaders(),
      });

      if (!res.ok) {
        console.error(
          `[Beehiiv] fetchSubscriberGrowth page ${page} failed: ${res.status}`
        );
        break;
      }

      const json = await res.json();
      const subs = json.data ?? [];

      if (subs.length === 0) {
        hasMore = false;
        break;
      }

      allSubscriptions.push(
        ...subs.map((s: { created: number }) => ({ created: s.created }))
      );

      // Stop paginating if we've gone past our date window
      const cutoff = Date.now() / 1000 - days * 86400;
      const oldest = subs[subs.length - 1]?.created ?? 0;
      if (oldest < cutoff) {
        hasMore = false;
      } else {
        page++;
        // Safety limit to avoid runaway pagination
        if (page > 50) hasMore = false;
      }
    }

    // Count new subs per day within the requested window
    const cutoffMs = Date.now() - days * 86400 * 1000;
    const dailyCounts = new Map<string, number>();

    for (const sub of allSubscriptions) {
      const createdMs = sub.created * 1000;
      if (createdMs < cutoffMs) continue;

      const dateStr = new Date(createdMs).toISOString().split("T")[0];
      dailyCounts.set(dateStr, (dailyCounts.get(dateStr) ?? 0) + 1);
    }

    // Build array sorted by date
    return Array.from(dailyCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    console.error("[Beehiiv] fetchSubscriberGrowth error:", err);
    return [];
  }
}

// ── Newsletter Posts ─────────────────────────────────────
export interface NewsletterPost {
  id: string;
  title: string;
  subject: string;
  sentAt: string | null;
  stats: {
    opens: number;
    clicks: number;
    openRate: number;
    clickRate: number;
  };
}

export async function fetchNewsletterPosts(
  limit: number
): Promise<NewsletterPost[]> {
  try {
    const pubId = getPublicationId();
    const url = new URL(`${BASE_URL}/publications/${pubId}/posts`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("status", "confirmed");

    const res = await fetch(url.toString(), {
      headers: getHeaders(),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(
        `[Beehiiv] fetchNewsletterPosts failed: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const json = await res.json();
    const posts = json.data ?? [];

    return posts.map(
      (p: {
        id: string;
        title: string;
        subject_line: string;
        publish_date: number | null;
        stats: {
          email_total_opens?: number;
          email_total_clicks?: number;
          email_open_rate?: number;
          email_click_rate?: number;
        };
      }) => ({
        id: p.id,
        title: p.title ?? "",
        subject: p.subject_line ?? "",
        sentAt: p.publish_date
          ? new Date(p.publish_date * 1000).toISOString()
          : null,
        stats: {
          opens: p.stats?.email_total_opens ?? 0,
          clicks: p.stats?.email_total_clicks ?? 0,
          openRate: p.stats?.email_open_rate ?? 0,
          clickRate: p.stats?.email_click_rate ?? 0,
        },
      })
    );
  } catch (err) {
    console.error("[Beehiiv] fetchNewsletterPosts error:", err);
    return [];
  }
}
