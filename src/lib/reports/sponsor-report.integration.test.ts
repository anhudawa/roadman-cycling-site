import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Isolated temp dir per process $— prevents race conditions when multiple
// worktree test runs write to the shared content/podcast/ directory.
const FIXTURE_DIR = path.join(__dirname, '__fixtures__');
const TEMP_PODCAST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'roadman-sponsor-test-'));

// Override the podcast dir used by sponsor-report.ts before any imports.
process.env.TEST_PODCAST_DIR = TEMP_PODCAST_DIR;

// Also mock getAllEpisodes so the episode list comes from TEMP_PODCAST_DIR,
// not the real content/podcast directory.
vi.mock('@/lib/podcast', () => {
  const matter = require('gray-matter');
  const path = require('path');
  const fs = require('fs');
  const dir = process.env.TEST_PODCAST_DIR!;
  return {
    getAllEpisodes: () => {
      const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.mdx'));
      return files.map((filename: string) => {
        const slug = filename.replace(/\.mdx$/, '');
        const { data } = matter(fs.readFileSync(path.join(dir, filename), 'utf-8'));
        return { ...data, slug };
      });
    },
  };
});

describe('buildSponsorReport (integration)', () => {
  beforeAll(() => {
    for (const f of fs.readdirSync(FIXTURE_DIR)) {
      fs.copyFileSync(path.join(FIXTURE_DIR, f), path.join(TEMP_PODCAST_DIR, f));
    }
  });

  afterAll(() => {
    fs.rmSync(TEMP_PODCAST_DIR, { recursive: true, force: true });
    delete process.env.TEST_PODCAST_DIR;
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
