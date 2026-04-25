import { db } from "@/lib/db";
import { teamUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  CALENDAR_SCOPE_EMAIL,
  refreshAccessToken,
} from "@/lib/admin/google-oauth";

/**
 * Read-only Google Calendar access for Anthony.
 * We store Anthony's refresh token on team_users.google_refresh_token at
 * OAuth time and exchange it for a short-lived access token on each call.
 */

const EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  start: Date;
  end: Date;
  allDay: boolean;
  htmlLink: string;
  hangoutLink: string | null;
  attendees: Array<{ email: string; displayName: string | null; status: string }>;
  status: string;
}

async function getOwnerRefreshToken(): Promise<string | null> {
  const rows = await db
    .select({ token: teamUsers.googleRefreshToken })
    .from(teamUsers)
    .where(eq(teamUsers.email, CALENDAR_SCOPE_EMAIL))
    .limit(1);
  return rows[0]?.token ?? null;
}

export interface FetchOpts {
  /** Default: now. Events starting on/after this time are returned. */
  from?: Date;
  /** Default: now + 30 days. */
  to?: Date;
  /** Default: 50. */
  max?: number;
}

export interface FetchResult {
  events: CalendarEvent[];
  /** True when OAuth isn't set up yet; caller should prompt user to link. */
  needsLink: boolean;
  /** True if the env vars for Google OAuth aren't set at all. */
  notConfigured: boolean;
  /** Any error encountered (other than needsLink / notConfigured). */
  errorMessage: string | null;
}

export async function fetchOwnerCalendarEvents(
  opts: FetchOpts = {}
): Promise<FetchResult> {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REDIRECT_URI
  ) {
    return {
      events: [],
      needsLink: false,
      notConfigured: true,
      errorMessage: null,
    };
  }

  const refreshToken = await getOwnerRefreshToken();
  if (!refreshToken) {
    return {
      events: [],
      needsLink: true,
      notConfigured: false,
      errorMessage: null,
    };
  }

  let accessToken: string;
  try {
    const t = await refreshAccessToken(refreshToken);
    accessToken = t.access_token;
  } catch (err) {
    return {
      events: [],
      needsLink: true,
      notConfigured: false,
      errorMessage:
        err instanceof Error
          ? err.message
          : "Failed to refresh access token — re-link Google",
    };
  }

  const from = opts.from ?? new Date();
  const to = opts.to ?? new Date(Date.now() + 30 * 86400000);
  const max = opts.max ?? 50;

  const params = new URLSearchParams({
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    maxResults: String(max),
    singleEvents: "true",
    orderBy: "startTime",
  });

  const res = await fetch(`${EVENTS_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // Revalidate every 60s — this page is server-rendered; we don't need
    // to hammer Google on every request.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      events: [],
      needsLink: res.status === 401,
      notConfigured: false,
      errorMessage: `Calendar API ${res.status}: ${body.slice(0, 200)}`,
    };
  }

  const json = (await res.json()) as {
    items?: Array<{
      id: string;
      summary?: string;
      description?: string;
      location?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
      htmlLink?: string;
      hangoutLink?: string;
      status?: string;
      attendees?: Array<{
        email: string;
        displayName?: string;
        responseStatus?: string;
      }>;
    }>;
  };

  const events: CalendarEvent[] = (json.items ?? []).map((ev) => {
    const startIso = ev.start?.dateTime ?? ev.start?.date;
    const endIso = ev.end?.dateTime ?? ev.end?.date;
    const allDay = !ev.start?.dateTime;
    return {
      id: ev.id,
      summary: ev.summary ?? "(no title)",
      description: ev.description ?? null,
      location: ev.location ?? null,
      start: startIso ? new Date(startIso) : new Date(0),
      end: endIso ? new Date(endIso) : new Date(0),
      allDay,
      htmlLink: ev.htmlLink ?? "#",
      hangoutLink: ev.hangoutLink ?? null,
      attendees: (ev.attendees ?? []).map((a) => ({
        email: a.email,
        displayName: a.displayName ?? null,
        status: a.responseStatus ?? "needsAction",
      })),
      status: ev.status ?? "confirmed",
    };
  });

  return {
    events,
    needsLink: false,
    notConfigured: false,
    errorMessage: null,
  };
}
