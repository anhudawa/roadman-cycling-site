import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Point podcast loader at our fixture dir by symlinking before tests
const FIXTURE_DIR = path.join(__dirname, '__fixtures__');
const PODCAST_DIR = path.join(process.cwd(), 'content/podcast');

describe('buildSponsorReport (integration)', () => {
  beforeAll(() => {
    for (const f of fs.readdirSync(FIXTURE_DIR)) {
      fs.copyFileSync(path.join(FIXTURE_DIR, f), path.join(PODCAST_DIR, f));
    }
  });

  afterAll(() => {
    for (const f of fs.readdirSync(FIXTURE_DIR)) {
      fs.unlinkSync(path.join(PODCAST_DIR, f));
    }
  });

  it('finds mentions of a sponsor in an April episode', async () => {
    vi.doMock('@/lib/inventory', () => ({
      getSponsors: async () => [
        {
          id: 'sp-tp',
          brandName: 'Training Peaks',
          contactName: null,
          contactEmail: 't@tp.com',
          tier: 'annual',
          contractStart: null,
          contractEnd: null,
          totalValue: null,
          renewalDate: null,
          lastContact: null,
          notes: null,
          logoUrl: null,
          brandAliases: '',
        },
      ],
    }));
    vi.doMock('@/lib/analytics/ga4', () => ({
      getMonthlyWebSessions: async () => 12345,
    }));
    vi.doMock('@/lib/reports/downloads', () => ({
      getDownloads: async (_id: string) => 100000,
    }));
    vi.doMock('@/lib/reports/social-stats', () => ({
      getSocialStats: async () => ({ facebook: null, x: null, instagram: null }),
    }));

    const { buildSponsorReport } = await import('./sponsor-report');
    const payload = await buildSponsorReport('sp-tp', '2026-04');
    expect(payload).not.toBeNull();
    expect(payload!.headline.mentionCount).toBe(2);
    expect(payload!.episodeGroups).toHaveLength(1);
    expect(payload!.episodeGroups[0].episodeNumber).toBe(999);
    expect(payload!.platforms.find((p) => p.platform === 'website')?.views).toBe(12345);
  });
});
