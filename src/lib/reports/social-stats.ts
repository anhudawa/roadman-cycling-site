// src/lib/reports/social-stats.ts
import { db } from '@/lib/db';
import { monthlySocialStats } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export type SocialPlatform = 'facebook' | 'x' | 'instagram';

export interface SocialStatEntry {
  platform: SocialPlatform;
  views: number;
}

export async function getSocialStats(month: string): Promise<Record<SocialPlatform, number | null>> {
  const rows = await db
    .select()
    .from(monthlySocialStats)
    .where(eq(monthlySocialStats.month, month));

  const out: Record<SocialPlatform, number | null> = {
    facebook: null,
    x: null,
    instagram: null,
  };
  for (const r of rows) {
    if (r.platform === 'facebook' || r.platform === 'x' || r.platform === 'instagram') {
      out[r.platform] = r.views;
    }
  }
  return out;
}

export async function upsertSocialStats(
  month: string,
  entries: SocialStatEntry[],
  enteredBy?: string,
): Promise<void> {
  for (const entry of entries) {
    await db
      .insert(monthlySocialStats)
      .values({ month, platform: entry.platform, views: entry.views, enteredBy })
      .onConflictDoUpdate({
        target: [monthlySocialStats.month, monthlySocialStats.platform],
        set: { views: entry.views, enteredBy, enteredAt: sql`now()` },
      });
  }
}
