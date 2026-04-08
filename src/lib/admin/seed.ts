import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { TrackingEvent, EventType } from "./events-store";
import { maskEmail } from "./events-store";

const DATA_DIR = path.join(process.cwd(), "data");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

const PAGES = [
  "/",
  "/podcast",
  "/blog",
  "/blog/zone-2-training-guide",
  "/blog/cycling-nutrition-basics",
  "/blog/strength-training-for-cyclists",
  "/newsletter",
  "/about",
  "/community",
  "/community/club",
  "/community/not-done-yet",
  "/events",
  "/strength-training",
  "/tools/ftp-zones",
  "/tools/fuelling",
  "/tools/race-weight",
  "/tools/tyre-pressure",
  "/partners",
  "/podcast/ep-142-fuelling-for-gran-fondos",
  "/podcast/ep-141-recovery-masterclass",
  "/topics/nutrition",
  "/topics/training",
];

const REFERRERS = [
  "https://www.google.com",
  "https://www.youtube.com",
  "https://www.instagram.com",
  "https://www.facebook.com",
  "https://twitter.com",
  "https://www.strava.com",
  "https://www.reddit.com/r/cycling",
  "",
  "",
  "", // Direct traffic (weighted)
];

const EMAILS = [
  "john.smith@gmail.com",
  "sarah.cyclist@outlook.com",
  "mike.roadie@yahoo.com",
  "emma.watts@gmail.com",
  "david.cadence@hotmail.com",
  "lisa.climbing@gmail.com",
  "james.ftp@icloud.com",
  "anna.gravel@proton.me",
  "tom.endurance@gmail.com",
  "kate.nutrition@outlook.com",
  "ryan.intervals@gmail.com",
  "olivia.recovery@yahoo.com",
  "ben.training@gmail.com",
  "sophie.zwo@hotmail.com",
  "marcus.peloton@gmail.com",
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomUA(): string {
  const uas = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  ];
  return pick(uas);
}

function detectDevice(ua: string): "mobile" | "desktop" | "tablet" {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function seedEvents(): Promise<number> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }

  // Check if already seeded
  if (existsSync(EVENTS_FILE)) {
    try {
      const raw = await readFile(EVENTS_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (data.events && data.events.length > 100) {
        return data.events.length; // Already seeded
      }
    } catch {
      // Continue with seeding
    }
  }

  const events: TrackingEvent[] = [];
  const now = new Date();

  // Generate 30 days of data
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    // More traffic on recent days, weekday traffic higher
    const dayOfWeek = date.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const recencyBoost = Math.max(0.5, 1 - daysAgo * 0.015);
    const baseViews = isWeekday ? rand(80, 180) : rand(40, 100);
    const dayViews = Math.round(baseViews * recencyBoost);

    // Generate pageviews spread across the day
    for (let i = 0; i < dayViews; i++) {
      const hour = rand(6, 23);
      const minute = rand(0, 59);
      const second = rand(0, 59);
      const ts = new Date(date);
      ts.setHours(hour, minute, second, rand(0, 999));

      const ua = randomUA();
      const page = pick(PAGES);

      events.push({
        id: generateId(),
        type: "pageview",
        timestamp: ts.toISOString(),
        page,
        referrer: pick(REFERRERS) || undefined,
        userAgent: ua,
        device: detectDevice(ua),
      });
    }

    // Generate signups (3-8% conversion rate)
    const signupCount = Math.round(dayViews * (rand(3, 8) / 100));
    for (let i = 0; i < signupCount; i++) {
      const hour = rand(7, 22);
      const minute = rand(0, 59);
      const ts = new Date(date);
      ts.setHours(hour, minute, rand(0, 59), rand(0, 999));

      const signupPages = ["/newsletter", "/", "/blog/zone-2-training-guide", "/strength-training", "/podcast"];

      events.push({
        id: generateId(),
        type: "signup",
        timestamp: ts.toISOString(),
        page: pick(signupPages),
        email: maskEmail(pick(EMAILS)),
        source: pick(signupPages),
        device: detectDevice(randomUA()),
      });
    }

    // Occasional Skool trial starts
    if (rand(1, 3) === 1) {
      const trialCount = rand(0, 2);
      for (let i = 0; i < trialCount; i++) {
        const ts = new Date(date);
        ts.setHours(rand(9, 20), rand(0, 59), rand(0, 59));

        events.push({
          id: generateId(),
          type: "skool_trial",
          timestamp: ts.toISOString(),
          page: "/community/club",
          source: "skool",
        });
      }
    }
  }

  // Sort by timestamp
  events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  await writeFile(EVENTS_FILE, JSON.stringify({ events }, null, 2), "utf-8");
  return events.length;
}
