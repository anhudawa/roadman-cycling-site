import { and, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

export const APP_WAITLIST_EVENT_SOURCE_PREFIX = "roadman-app-waitlist-";

export interface AppWaitlistEventRow {
  id: number;
  type: string;
  timestamp: Date;
  page: string;
  source: string | null;
  sessionId: string;
  email: string | null;
  referrer: string | null;
  aiReferrer: string | null;
  meta: Record<string, unknown> | null;
}

export interface AppWaitlistBreakdownRow {
  key: string;
  label: string;
  submissions: number;
  uniqueLeads: number;
}

export interface AppWaitlistFunnel {
  available: boolean;
  range: { from: Date; to: Date };
  tracked: {
    appPageviews: number;
    appSessions: number;
    aiSessions: number;
    sourceTaggedSessions: number;
    contentCtaSessions: number;
    formStartSessions: number;
    confirmedCaptureSessions: number;
    formStartRate: number | null;
    formCompletionRate: number | null;
    trackedVisitToCaptureRate: number | null;
  };
  operational: {
    submissionAttempts: number;
    uniqueLeads: number;
    repeatAttempts: number;
  };
  acquisitionSources: AppWaitlistBreakdownRow[];
  placements: AppWaitlistBreakdownRow[];
}

function isKnownSession(value: string) {
  return Boolean(value && value !== "unknown");
}

function isAppPath(value: string) {
  try {
    const url = new URL(value, "https://roadmancycling.com");
    return url.pathname.replace(/\/$/, "") === "/app";
  } catch {
    return false;
  }
}

function sourceFromAppPage(value: string): string | null {
  try {
    const source = new URL(value, "https://roadmancycling.com").searchParams
      .get("source")
      ?.trim();
    return source || null;
  } catch {
    return null;
  }
}

function destinationFrom(row: AppWaitlistEventRow) {
  const value = row.meta?.destination;
  return typeof value === "string" ? value : null;
}

function titleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseAppWaitlistEventSource(source: string | null): {
  acquisitionSource: string;
  placement: "hero" | "bottom" | "unknown";
} | null {
  if (!source?.startsWith(APP_WAITLIST_EVENT_SOURCE_PREFIX)) return null;
  const value = source.slice(APP_WAITLIST_EVENT_SOURCE_PREFIX.length);
  const placementMatch = value.match(/(?:^|-)(hero|bottom)$/);
  const placement = (placementMatch?.[1] ?? "unknown") as
    | "hero"
    | "bottom"
    | "unknown";
  const acquisitionSource = placementMatch
    ? value.slice(0, placementMatch.index).replace(/-$/, "") || "direct"
    : value || "direct";
  return { acquisitionSource, placement };
}

function buildBreakdown(
  rows: AppWaitlistEventRow[],
  selectKey: (source: ReturnType<typeof parseAppWaitlistEventSource>) => string,
) {
  const buckets = new Map<
    string,
    { submissions: number; emails: Set<string> }
  >();
  for (const row of rows) {
    const source = parseAppWaitlistEventSource(row.source);
    if (!source) continue;
    const key = selectKey(source);
    const bucket = buckets.get(key) ?? {
      submissions: 0,
      emails: new Set<string>(),
    };
    bucket.submissions += 1;
    if (row.email) bucket.emails.add(row.email);
    buckets.set(key, bucket);
  }
  return [...buckets.entries()]
    .map(([key, value]) => ({
      key,
      label: key === "direct" ? "Direct / untagged" : titleCase(key),
      submissions: value.submissions,
      uniqueLeads: value.emails.size,
    }))
    .sort(
      (a, b) =>
        b.uniqueLeads - a.uniqueLeads ||
        b.submissions - a.submissions ||
        a.label.localeCompare(b.label),
    );
}

function rate(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : null;
}

export function aggregateAppWaitlistEvents(
  rows: AppWaitlistEventRow[],
  from: Date,
  to: Date,
): AppWaitlistFunnel {
  const appPageviews = rows.filter(
    (row) =>
      (row.type === "pageview" || row.type === "page_view") &&
      isAppPath(row.page),
  );
  const appSessions = new Set(
    appPageviews
      .map((row) => row.sessionId)
      .filter((sessionId) => isKnownSession(sessionId)),
  );
  const aiSessions = new Set(
    appPageviews
      .filter((row) => Boolean(row.aiReferrer))
      .map((row) => row.sessionId)
      .filter((sessionId) => isKnownSession(sessionId)),
  );
  const sourceTaggedSessions = new Set(
    appPageviews
      .filter((row) => Boolean(sourceFromAppPage(row.page)))
      .map((row) => row.sessionId)
      .filter((sessionId) => isKnownSession(sessionId)),
  );
  const contentCtaSessions = new Set(
    rows
      .filter(
        (row) =>
          row.type === "cta_click" &&
          Boolean(destinationFrom(row)) &&
          isAppPath(destinationFrom(row)!),
      )
      .map((row) => row.sessionId)
      .filter((sessionId) => isKnownSession(sessionId)),
  );
  const formStartSessions = new Set(
    rows
      .filter(
        (row) =>
          row.type === "form_start" &&
          parseAppWaitlistEventSource(row.source) !== null,
      )
      .map((row) => row.sessionId)
      .filter((sessionId) => isKnownSession(sessionId)),
  );
  const confirmedCaptureSessions = new Set(
    rows
      .filter(
        (row) =>
          row.type === "email_captured" &&
          parseAppWaitlistEventSource(row.source) !== null,
      )
      .map((row) => row.sessionId)
      .filter((sessionId) => isKnownSession(sessionId)),
  );
  const submissionRows = rows.filter(
    (row) =>
      row.type === "signup" &&
      parseAppWaitlistEventSource(row.source) !== null,
  );
  const uniqueEmails = new Set(
    submissionRows.map((row) => row.email).filter(Boolean),
  );

  return {
    available: true,
    range: { from, to },
    tracked: {
      appPageviews: appPageviews.length,
      appSessions: appSessions.size,
      aiSessions: aiSessions.size,
      sourceTaggedSessions: sourceTaggedSessions.size,
      contentCtaSessions: contentCtaSessions.size,
      formStartSessions: formStartSessions.size,
      confirmedCaptureSessions: confirmedCaptureSessions.size,
      formStartRate: rate(formStartSessions.size, appSessions.size),
      formCompletionRate: rate(
        confirmedCaptureSessions.size,
        formStartSessions.size,
      ),
      trackedVisitToCaptureRate: rate(
        confirmedCaptureSessions.size,
        appSessions.size,
      ),
    },
    operational: {
      submissionAttempts: submissionRows.length,
      uniqueLeads: uniqueEmails.size,
      repeatAttempts: Math.max(0, submissionRows.length - uniqueEmails.size),
    },
    acquisitionSources: buildBreakdown(
      submissionRows,
      (source) => source?.acquisitionSource ?? "direct",
    ),
    placements: buildBreakdown(
      submissionRows,
      (source) => source?.placement ?? "unknown",
    ),
  };
}

function unavailable(from: Date, to: Date): AppWaitlistFunnel {
  return {
    ...aggregateAppWaitlistEvents([], from, to),
    available: false,
  };
}

export async function getAppWaitlistFunnel(
  from: Date,
  to: Date,
): Promise<AppWaitlistFunnel> {
  try {
    const rows = await db
      .select({
        id: events.id,
        type: events.type,
        timestamp: events.timestamp,
        page: events.page,
        source: events.source,
        sessionId: events.sessionId,
        email: events.email,
        referrer: events.referrer,
        aiReferrer: events.aiReferrer,
        meta: events.meta,
      })
      .from(events)
      .where(
        and(
          gte(events.timestamp, from),
          lte(events.timestamp, to),
          or(
            and(
              inArray(events.type, ["pageview", "page_view"]),
              or(
                eq(events.page, "/app"),
                eq(events.page, "/app/"),
                like(events.page, "/app?%"),
                like(events.page, "/app/?%"),
              ),
            ),
            and(
              inArray(events.type, ["form_start", "email_captured", "signup"]),
              like(events.source, `${APP_WAITLIST_EVENT_SOURCE_PREFIX}%`),
            ),
            and(
              eq(events.type, "cta_click"),
              sql`${events.meta}->>'destination' LIKE '/app%'`,
            ),
          ),
        ),
      );
    return aggregateAppWaitlistEvents(
      rows as AppWaitlistEventRow[],
      from,
      to,
    );
  } catch (error) {
    console.error("[App waitlist funnel] query failed:", error);
    return unavailable(from, to);
  }
}
