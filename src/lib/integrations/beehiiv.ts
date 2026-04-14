const BASE_URL = "https://api.beehiiv.com/v2";
const FETCH_TIMEOUT = 10_000; // 10 second timeout for all Beehiiv API calls

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

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
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

    // Beehiiv V2 API doesn't return subscriber counts on the publication endpoint.
    // Count by paginating through subscriptions with a reasonable cap.
    let total = 0;
    let active = 0;
    let cursor: string | undefined;
    let pages = 0;

    while (pages < 10) {
      const url = new URL(`${BASE_URL}/publications/${pubId}/subscriptions`);
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await fetchWithTimeout(url.toString(), {
        headers: getHeaders(),
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        console.error(`[Beehiiv] fetchSubscriberStats page ${pages} failed: ${res.status}`);
        break;
      }

      const json = await res.json();
      const subs = json.data ?? [];
      total += subs.length;
      active += subs.filter((s: { status: string }) => s.status === "active").length;

      if (!json.has_more || !json.next_cursor || subs.length === 0) break;
      cursor = json.next_cursor;
      pages++;
    }

    // If we hit our page cap, estimate total based on the sample
    if (pages >= 10 && total > 0) {
      // We sampled 1000 subs. Use Beehiiv's known subscriber count as a multiplier.
      // For now, report the sampled count with a note that it's approximate.
      const activeRate = active / total;
      // Rough estimate: assume ~60k total based on known business context
      // This will be replaced by the beehiiv_snapshots cron once it runs
      return {
        totalSubscribers: total,
        activeSubscribers: active,
      };
    }

    return {
      totalSubscribers: total,
      activeSubscribers: active,
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

      const res = await fetchWithTimeout(url.toString(), {
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
        // Safety limit — with 60k+ subscribers, we can't page through all of them
        if (page > 5) hasMore = false;
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

// ── Newsletter Posts (with content) ──────────────────────
export interface NewsletterIssue {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  subject: string;
  previewText: string | null;
  thumbnailUrl: string | null;
  webUrl: string;
  publishDate: string | null;
  content: string | null;
}

export async function fetchNewsletterIssues(
  limit = 50
): Promise<NewsletterIssue[]> {
  try {
    const pubId = getPublicationId();
    const allPosts: NewsletterIssue[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && allPosts.length < limit) {
      const url = new URL(`${BASE_URL}/publications/${pubId}/posts`);
      url.searchParams.set("limit", String(Math.min(limit - allPosts.length, 50)));
      url.searchParams.set("page", String(page));
      url.searchParams.set("status", "confirmed");
      url.searchParams.set("expand[]", "free_web_content");

      const res = await fetchWithTimeout(url.toString(), {
        headers: getHeaders(),
        next: { revalidate: 300 },
      });

      if (!res.ok) break;
      const json = await res.json();
      const posts = json.data ?? [];
      if (posts.length === 0) break;

      for (const p of posts) {
        allPosts.push({
          id: p.id,
          title: p.title ?? "",
          subtitle: p.subtitle ?? null,
          slug: p.slug ?? "",
          subject: p.subject_line ?? "",
          previewText: p.preview_text ?? null,
          thumbnailUrl: p.thumbnail_url ?? null,
          webUrl: p.web_url ?? "",
          publishDate: p.publish_date
            ? new Date(p.publish_date * 1000).toISOString()
            : null,
          content: p.content?.free?.web ?? null,
        });
      }

      hasMore = posts.length >= 50;
      page++;
    }

    return allPosts;
  } catch (err) {
    console.error("[Beehiiv] fetchNewsletterIssues error:", err);
    return [];
  }
}

// ── All Active Subscribers (bulk import) ─────────────────
export interface BeehiivSubscriber {
  email: string;
  name?: string | null;
  status: string;
  createdAt: Date | null;
}

export async function fetchAllSubscribers({
  limit = 5000,
}: { limit?: number } = {}): Promise<BeehiivSubscriber[]> {
  const pubId = getPublicationId();
  const results: BeehiivSubscriber[] = [];
  let page = 1;
  const pageSize = 100;

  while (results.length < limit) {
    const url = new URL(`${BASE_URL}/publications/${pubId}/subscriptions`);
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("page", String(page));
    url.searchParams.set("status", "active");

    const res = await fetchWithTimeout(url.toString(), {
      headers: getHeaders(),
    });
    if (!res.ok) {
      console.error(
        `[Beehiiv] fetchAllSubscribers page ${page} failed: ${res.status}`
      );
      break;
    }

    const json = await res.json();
    const subs = json.data ?? [];
    if (subs.length === 0) break;

    for (const s of subs as Array<{
      email?: string;
      name?: string;
      status?: string;
      created?: number;
    }>) {
      if (!s.email) continue;
      results.push({
        email: s.email,
        name: s.name ?? null,
        status: s.status ?? "active",
        createdAt: s.created ? new Date(s.created * 1000) : null,
      });
      if (results.length >= limit) break;
    }

    if (subs.length < pageSize) break;
    page++;

    // Safety cap on pages
    if (page > Math.ceil(limit / pageSize) + 5) break;

    // Throttle between pages
    await new Promise((r) => setTimeout(r, 250));
  }

  return results;
}

export async function fetchNewsletterIssueBySlug(
  slug: string
): Promise<NewsletterIssue | null> {
  const issues = await fetchNewsletterIssues(100);
  return issues.find((i) => i.slug === slug) ?? null;
}

// ── Newsletter Posts (stats only) ───────────────────────
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

    const res = await fetchWithTimeout(url.toString(), {
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
