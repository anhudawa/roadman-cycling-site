import fs from "fs";
import path from "path";

const DRAFTS_DIR = path.join(process.cwd(), "content/drafts");

interface ManifestEntry {
  slug: string;
  status: "draft" | "reviewed" | "published";
  generatedAt: string;
  reviewedAt: string | null;
}

interface Manifest {
  generatedAt: string;
  entries: ManifestEntry[];
}

/**
 * Ensure draft directories exist
 */
export function ensureDraftDirs(): void {
  const dirs = [
    DRAFTS_DIR,
    path.join(DRAFTS_DIR, "hubs"),
    path.join(DRAFTS_DIR, "companion"),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Write a draft MDX file
 */
export function writeDraft(
  subdir: string,
  filename: string,
  content: string,
  dryRun: boolean = false
): string {
  ensureDraftDirs();
  const filePath = path.join(DRAFTS_DIR, subdir, filename);

  if (dryRun) {
    console.log(`  [DRY RUN] Would write: ${filePath}`);
    console.log(`  Content: ${content.slice(0, 200)}...`);
    return filePath;
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  $œ… Wrote: ${filePath}`);
  return filePath;
}

/**
 * Read or create a manifest file
 */
export function readManifest(name: string): Manifest {
  const filePath = path.join(DRAFTS_DIR, `${name}-manifest.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return { generatedAt: new Date().toISOString(), entries: [] };
}

/**
 * Save a manifest file
 */
export function saveManifest(name: string, manifest: Manifest, dryRun: boolean = false): void {
  ensureDraftDirs();
  const filePath = path.join(DRAFTS_DIR, `${name}-manifest.json`);
  if (dryRun) {
    console.log(`  [DRY RUN] Would update manifest: ${filePath}`);
    return;
  }
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), "utf-8");
}

/**
 * Add or update an entry in a manifest
 */
export function upsertManifestEntry(manifest: Manifest, slug: string): Manifest {
  const existing = manifest.entries.find((e) => e.slug === slug);
  if (existing) {
    existing.generatedAt = new Date().toISOString();
    existing.status = "draft";
  } else {
    manifest.entries.push({
      slug,
      status: "draft",
      generatedAt: new Date().toISOString(),
      reviewedAt: null,
    });
  }
  manifest.generatedAt = new Date().toISOString();
  return manifest;
}

/**
 * Check if a slug has already been processed
 */
export function isProcessed(manifest: Manifest, slug: string): boolean {
  return manifest.entries.some((e) => e.slug === slug);
}
