import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/lib/db";
import { roadmanEvents } from "../src/lib/db/schema";

async function main() {
  await db.delete(roadmanEvents);

  await db.insert(roadmanEvents).values([
    {
      name: "Saturday Morning Group Ride — Dublin",
      type: "group_ride",
      startsAt: new Date("2026-05-03T08:00:00Z"),
      location: "Dublin, Ireland",
      description:
        "Weekly Roadman CC group ride. All paces welcome, coffee stop included. Details shared in Clubhouse community.",
      isMembersOnly: false,
      url: "https://roadmancycling.com/community/club",
      isActive: true,
    },
    {
      name: "NDY Live Q&A — May 2026",
      type: "live_qa",
      startsAt: new Date("2026-05-07T19:00:00Z"),
      location: null,
      description:
        "Monthly live Q&A with Anthony in the Not Done Yet community. Submit questions in advance via the Skool post.",
      isMembersOnly: true,
      url: "https://www.skool.com/not-done-yet",
      isActive: true,
    },
    {
      name: "NDY Live Q&A — June 2026",
      type: "live_qa",
      startsAt: new Date("2026-06-04T19:00:00Z"),
      location: null,
      description: "Monthly live Q&A with Anthony for Not Done Yet members.",
      isMembersOnly: true,
      url: "https://www.skool.com/not-done-yet",
      isActive: true,
    },
    {
      name: "Migration Gravel — Girona 2026",
      type: "training_camp",
      startsAt: new Date("2026-09-20T09:00:00Z"),
      location: "Girona, Spain",
      description:
        "The annual Roadman Migration Gravel trip. Five days of riding in Girona with the NDY community. Limited spots — sign up early.",
      isMembersOnly: false,
      url: "https://roadmancycling.com/events/migration-gravel-2026",
      isActive: true,
    },
    {
      name: "Roadman Summer Camp — Ireland",
      type: "training_camp",
      startsAt: new Date("2026-07-18T09:00:00Z"),
      location: "Wicklow, Ireland",
      description:
        "Three-day summer training camp in the Wicklow Mountains. Group rides, coaching sessions, and nutrition workshops. Open to all.",
      isMembersOnly: false,
      url: "https://roadmancycling.com/events/summer-camp-2026",
      isActive: true,
    },
  ]);

  console.log("✓ roadman_events seeded");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
