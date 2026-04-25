import { YoutubeTranscript } from "youtube-transcript";
import { writeFileSync } from "fs";

// Top 30 most popular episodes that DON'T already have blog posts
const videos = [
  { id: "xXJpHjrtI8M", title: "5 Fixable Mistakes Self-Coached Cyclists Make" },
  { id: "Yk8JTBqQ1xw", title: "Is Losing Weight Actually Making You Slower" },
  { id: "sdp1ZbjGpJs", title: "15 Years Of Pro Riding - What Amateurs Dont Know Matthews" },
  { id: "INEUYf7iJWY", title: "Secret To Winter Training" },
  { id: "x-b66_jHBVk", title: "Pro Bike Fitter Reveals The 1 Change" },
  { id: "Zsb8Ro3zWCU", title: "5 Fixable Reasons Your Climbing Is Slow" },
  { id: "LV1ontMLacI", title: "5 Fixable Reasons You Cant Lose Weight" },
  { id: "TnVUNr1EFaU", title: "I Tried Eating Like Pidcock" },
  { id: "IJwg183i9C8", title: "7 Fixable Reasons Your VO2 Max Is Low" },
  { id: "U235zOYuuUE", title: "5 Fixable Reasons Your Heart Rate Is High" },
  { id: "HBx18rxMpkk", title: "Lachlan Morton Why I Quit World Tour" },
  { id: "N_niB626YsQ", title: "How Pogacar Became The Greatest Rider Ever" },
  { id: "9roRGEqFzbA", title: "I Trained Like A Pro Cyclist For 60 Days" },
  { id: "gQEdgOIPpcQ", title: "Pro Mechanic Most HATED Products" },
  { id: "767OE9IM1lg", title: "40 Year Old Amateur Beat Pogacar" },
];

async function main() {
  console.log(`Fetching transcripts for ${videos.length} top episodes...\n`);

  let success = 0;
  let failed = 0;

  for (const v of videos) {
    try {
      const segs = await YoutubeTranscript.fetchTranscript(v.id);
      const text = segs
        .map((s) => s.text)
        .join(" ")
        .replace(/\[Music\]/gi, "")
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();
      writeFileSync(`/tmp/transcript-${v.id}.txt`, text);
      console.log(`OK: ${v.id} (${v.title}) $€” ${text.split(" ").length} words`);
      success++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`FAIL: ${v.id} (${v.title}) $€” ${msg}`);
      failed++;
    }
    // Small delay
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nDone. ${success} OK, ${failed} failed.`);
}

main();
