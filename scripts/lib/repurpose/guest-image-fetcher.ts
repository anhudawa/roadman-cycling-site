import fs from "fs";
import path from "path";
import sharp from "sharp";

const GUESTS_DIR = path.join(process.cwd(), "content/guests");

// --- Helpers ---

export function guestSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, "") // remove apostrophes
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanum runs with hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// --- Google Custom Search ---

async function searchGoogleImage(guestName: string): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    return null;
  }

  const query = encodeURIComponent(`"${guestName}" cycling portrait`);
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image&imgSize=large&num=3`;

  let results: { link: string }[] = [];

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`  [guest-image] Google CSE request failed: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as { items?: { link: string }[] };
    results = data.items ?? [];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  [guest-image] Google CSE error: ${msg}`);
    return null;
  }

  for (const result of results) {
    const buffer = await fetchImageBuffer(result.link);
    if (buffer) {
      return buffer;
    }
  }

  return null;
}

// --- YouTube thumbnail ---

async function fetchYouTubeThumbnail(youtubeId: string): Promise<Buffer | null> {
  const qualities = ["maxresdefault", "hqdefault"] as const;

  for (const quality of qualities) {
    const url = `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
    const buffer = await fetchImageBuffer(url);
    if (buffer) {
      return buffer;
    }
  }

  return null;
}

// --- Image processing ---

async function processImage(buffer: Buffer, size: number = 1080): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 90 })
    .toBuffer();
}

// --- Main export ---

export async function fetchGuestImage(
  guestName: string | undefined,
  youtubeId: string | undefined
): Promise<Buffer | null> {
  // Priority 1: local file
  if (guestName) {
    const slug = guestSlug(guestName);
    const localPath = path.join(GUESTS_DIR, `${slug}.jpg`);

    if (fs.existsSync(localPath)) {
      console.log(`  [guest-image] Found local file for "${guestName}": ${localPath}`);
      const raw = fs.readFileSync(localPath);
      return processImage(raw);
    }
  }

  // Priority 2: Google Custom Search
  if (guestName) {
    console.log(`  [guest-image] Trying Google CSE for "${guestName}"...`);
    const buffer = await searchGoogleImage(guestName);
    if (buffer) {
      console.log(`  [guest-image] Google CSE found image for "${guestName}"`);
      const processed = await processImage(buffer);

      // Cache to content/guests/{slug}.jpg
      const slug = guestSlug(guestName);
      try {
        if (!fs.existsSync(GUESTS_DIR)) {
          fs.mkdirSync(GUESTS_DIR, { recursive: true });
        }
        const cachePath = path.join(GUESTS_DIR, `${slug}.jpg`);
        fs.writeFileSync(cachePath, processed);
        console.log(`  [guest-image] Cached to ${cachePath}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  [guest-image] Warning: could not cache image: ${msg}`);
      }

      return processed;
    }
    console.log(`  [guest-image] Google CSE returned no image for "${guestName}"`);
  }

  // Priority 3: YouTube thumbnail
  if (youtubeId) {
    console.log(`  [guest-image] Trying YouTube thumbnail for ID "${youtubeId}"...`);
    const buffer = await fetchYouTubeThumbnail(youtubeId);
    if (buffer) {
      console.log(`  [guest-image] YouTube thumbnail found for ID "${youtubeId}"`);
      return processImage(buffer);
    }
    console.log(`  [guest-image] YouTube thumbnail not available for ID "${youtubeId}"`);
  }

  // Priority 4: null
  console.log(`  [guest-image] No image found for guest "${guestName ?? "(none)"}"`);
  return null;
}
