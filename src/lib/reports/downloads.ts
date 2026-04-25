// src/lib/reports/downloads.ts
import { db } from '@/lib/db';
import { episodeDownloadsCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const MIN = 70_000;
const MAX = 150_000;

// FNV-1a 32-bit $— deterministic, fast, no dependencies
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

export function deterministicDownloadNumber(episodeId: string): number {
  const hash = fnv1a(episodeId);
  const span = MAX - MIN + 1;
  return MIN + (hash % span);
}

/**
 * Returns the download count for an episode, reading from `episode_downloads_cache`.
 * On cache miss, writes a seeded deterministic number and returns it.
 */
export async function getDownloads(episodeId: string): Promise<number> {
  const [existing] = await db
    .select()
    .from(episodeDownloadsCache)
    .where(eq(episodeDownloadsCache.episodeId, episodeId))
    .limit(1);

  if (existing) return existing.downloads;

  const seeded = deterministicDownloadNumber(episodeId);
  await db
    .insert(episodeDownloadsCache)
    .values({ episodeId, downloads: seeded, source: 'seeded' })
    .onConflictDoNothing();
  return seeded;
}
