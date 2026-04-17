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

    // Primary path: one API call with expand=stats.
    // Beehiiv V2 returns stats on the publication endpoint when requested.
    const pubUrl = new URL(`${BASE_URL}/publications/${pubId}`);
    pubUrl.searchParams.append("expand[]", "stats");

    const pubRes = await fetchWithTimeout(pubUrl.toString(), {
      headers: getHeaders(),
      next: { revalidate: 300 },
    });

    if (pubRes.ok) {
      const pubJson = await pubRes.json();
      const stats = pubJson?.data?.stats ?? pubJson?.stats ?? null;
      if (stats) {
        // Field names seen in the wild: active_subscriptions, total_subscriptions,
        // or active_subscription_count / total_subscription_count.
        const active =
          Number(
            stats.active_subscriptions ??
              stats.active_subscription_count ??
              stats.total_active_subscriptions ??
              0
          ) || 0;
        const total =
          Number(
            stats.total_subscriptions ??
              stats.total_subscription_count ??
              active
          ) || active;
        if (total > 0) {
          return { totalSubscribers: total, activeSubscribers: active || total };
        }
      }
    } else {
      console.error(
        `[Beehiiv] fetchSubscriberStats publication endpoint failed: ${pubRes.status}`
      );
    }

    // Fallback: read total_results from the subscriptions list (limit=1).
    const listUrl = new URL(`${BASE_URL}/publications/${pubId}/subscriptions`);
    listUrl.searchParams.set("limit", "1");
    listUrl.searchParams.set("page", "1");

    const listRes = await fetchWithTimeout(listUrl.toString(), {
      headers: getHeaders(),
      next: { revalidate: 300 },
    });
    if (!listRes.ok) {
      console.error(
        `[Beehiiv] fetchSubscriberStats fallback list failed: ${listRes.status}`
      );
      return null;
    }
    const listJson = await listRes.json();
    const total = Number(
      listJson.total_results ??
        listJson.pagination?.total ??
        (Array.isArray(listJson.data) ? listJson.data.length : 0)
    );
    if (!total) return null;

    // No efficient way to count active separately here — treat total as active
    // floor. Better accuracy requires the publication/stats response above.
    return { totalSubscribers: total, activeSubscribers: total };
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
    recipients: number;
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
    url.searchParams.set("order_by", "publish_date");
    url.searchParams.set("direction", "desc");
    // Without expand[]=stats, Beehiiv returns posts with no engagement
    // numbers — that's why the dashboard was showing 0% opens/clicks.
    url.searchParams.append("expand[]", "stats");

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

    return posts
      .map(
        (p: {
          id: string;
          title: string;
          subject_line: string;
          publish_date: number | null;
          status?: string;
          platform?: string;
          stats?: {
            email?: {
              recipients?: number;
              delivered?: number;
              opens?: number;
              unique_opens?: number;
              clicks?: number;
              unique_clicks?: number;
              open_rate?: number;
              click_rate?: number;
            };
            email_total_opens?: number;
            email_unique_opens?: number;
            email_total_clicks?: number;
            email_unique_clicks?: number;
            email_open_rate?: number;
            email_click_rate?: number;
            email_recipients?: number;
            email_delivered?: number;
          };
        }) => {
          const e = p.stats?.email;
          // Denominator: prefer delivered → recipients, both come from Beehiiv.
          const recipients =
            e?.delivered ??
            e?.recipients ??
            p.stats?.email_delivered ??
            p.stats?.email_recipients ??
            0;
          const opens = e?.unique_opens ?? e?.opens ?? p.stats?.email_unique_opens ?? p.stats?.email_total_opens ?? 0;
          const clicks = e?.unique_clicks ?? e?.clicks ?? p.stats?.email_unique_clicks ?? p.stats?.email_total_clicks ?? 0;
          // Recompute rates ourselves when we have a denominator; Beehiiv's
          // per-post email_open_rate sometimes ships as a 0..1 fraction and
          // sometimes as a percent — deriving avoids that ambiguity.
          const openRate =
            recipients > 0
              ? opens / recipients
              : typeof e?.open_rate === "number"
                ? e.open_rate
                : (p.stats?.email_open_rate ?? 0);
          const clickRate =
            recipients > 0
              ? clicks / recipients
              : typeof e?.click_rate === "number"
                ? e.click_rate
                : (p.stats?.email_click_rate ?? 0);
          return {
            id: p.id,
            title: p.title ?? "",
            subject: p.subject_line ?? "",
            sentAt: p.publish_date
              ? new Date(p.publish_date * 1000).toISOString()
              : null,
            stats: {
              opens,
              clicks,
              openRate,
              clickRate,
              recipients,
            },
          };
        }
      );
  } catch (err) {
    console.error("[Beehiiv] fetchNewsletterPosts error:", err);
    return [];
  }
}

// ── Subscribe + tag ─────────────────────────────────────
/**
 * Upsert a subscriber in Beehiiv and (optionally) apply tags.
 *
 * Handles the three real cases:
 *   - New email → creates, returns id
 *   - Already exists (HTTP 409) → looks up the existing id
 *   - API key missing or Beehiiv down → returns null (non-fatal; caller
 *     decides whether to retry or just log)
 *
 * Never throws — caller never needs to try/catch. We never want an
 * integration hiccup to block the main flow (e.g. a cohort application
 * landing in Postgres).
 */
export interface SubscribeOptions {
  email: string;
  name?: string | null;
  tags?: string[];
  customFields?: Record<string, string | number | null | undefined>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  /** Whether Beehiiv should send its own welcome email. Default: false. */
  sendWelcomeEmail?: boolean;
}

export interface SubscribeResult {
  subscriberId: string | null;
  created: boolean;
}

export async function subscribeToBeehiiv(
  options: SubscribeOptions,
): Promise<SubscribeResult> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !pubId) {
    console.error("[Beehiiv] Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID");
    return { subscriberId: null, created: false };
  }

  const custom: { name: string; value: string }[] = [];
  if (options.name) {
    const parts = options.name.trim().split(/\s+/);
    custom.push({ name: "first_name", value: parts[0] ?? "" });
    if (parts.length > 1) {
      custom.push({ name: "last_name", value: parts.slice(1).join(" ") });
    }
  }
  if (options.customFields) {
    for (const [name, rawValue] of Object.entries(options.customFields)) {
      if (rawValue == null || rawValue === "") continue;
      custom.push({ name, value: String(rawValue) });
    }
  }

  const utm = options.utm ?? {};
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  let subscriberId: string | null = null;
  let created = false;

  try {
    const createRes = await fetchWithTimeout(
      `${BASE_URL}/publications/${pubId}/subscriptions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: options.email,
          reactivate_existing: true,
          send_welcome_email: options.sendWelcomeEmail ?? false,
          ...(utm.source && { utm_source: utm.source }),
          ...(utm.medium && { utm_medium: utm.medium }),
          ...(utm.campaign && { utm_campaign: utm.campaign }),
          ...(custom.length > 0 && { custom_fields: custom }),
        }),
      },
    );

    if (createRes.ok) {
      const json = (await createRes.json()) as {
        data?: { id?: string };
      };
      subscriberId = json?.data?.id ?? null;
      created = true;
    } else if (createRes.status === 409) {
      // Already exists — look up the id.
      const lookupRes = await fetchWithTimeout(
        `${BASE_URL}/publications/${pubId}/subscriptions?email=${encodeURIComponent(options.email)}`,
        { headers },
      );
      if (lookupRes.ok) {
        const json = (await lookupRes.json()) as {
          data?: Array<{ id?: string }>;
        };
        subscriberId = json?.data?.[0]?.id ?? null;
      }
    } else {
      console.error(
        "[Beehiiv] subscribeToBeehiiv create error:",
        createRes.status,
        await createRes.text().catch(() => ""),
      );
      return { subscriberId: null, created: false };
    }
  } catch (err) {
    console.error("[Beehiiv] subscribeToBeehiiv request failed:", err);
    return { subscriberId: null, created: false };
  }

  if (subscriberId && options.tags && options.tags.length > 0) {
    try {
      await fetchWithTimeout(
        `${BASE_URL}/publications/${pubId}/subscriptions/${subscriberId}/tags`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ tags: options.tags }),
        },
      );
    } catch (err) {
      console.error("[Beehiiv] tag apply failed:", err);
      // still return the subscriberId — tagging failure is non-fatal
    }
  }

  return { subscriberId, created };
}
