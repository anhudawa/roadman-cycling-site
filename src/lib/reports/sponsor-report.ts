// src/lib/reports/sponsor-report.ts
import { getAllEpisodes } from '@/lib/podcast';
import { readFileSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getSponsors } from '@/lib/inventory';
import { findMentions } from './mentions';
import { approximateTimestamp, parseDurationString } from './timestamp';
import { getDownloads } from './downloads';
import { getSocialStats } from './social-stats';
import { getMonthlyWebSessions } from '@/lib/analytics/ga4';
import type { ReportPayload, EpisodeMentionGroup, PlatformStat } from './types';

const PODCAST_DIR = process.env.TEST_PODCAST_DIR ?? path.join(process.cwd(), 'content/podcast');

function aliasesFor(brandName: string, raw?: string): string[] {
  const fromField = (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [brandName, ...fromField];
  // dedupe case-insensitive
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of all) {
    const key = a.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(a);
    }
  }
  return out;
}

function loadTranscript(slug: string): string {
  try {
    const raw = readFileSync(path.join(PODCAST_DIR, `${slug}.mdx`), 'utf-8');
    const { data } = matter(raw);
    return typeof data.transcript === 'string' ? data.transcript : '';
  } catch {
    return '';
  }
}

function pctDelta(curr: number | null, prev: number | null): number | null {
  if (curr === null || prev === null || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function computeHeadlineCore(
  sponsorId: string,
  brandName: string,
  aliases: string[],
  month: string,
): Promise<{ mentionCount: number; totalReach: number; groups: EpisodeMentionGroup[] }> {
  const episodes = getAllEpisodes().filter((e) => e.publishDate.startsWith(month));
  const groups: EpisodeMentionGroup[] = [];
  let mentionCount = 0;
  let totalReach = 0;

  for (const ep of episodes) {
    const transcript = loadTranscript(ep.slug);
    if (!transcript) continue;
    const rawMentions = findMentions(transcript, aliases);
    if (rawMentions.length === 0) continue;

    const durationSeconds = parseDurationString(ep.duration);
    const mentions = rawMentions.map((m) => ({
      ...m,
      timestampSeconds: approximateTimestamp(m.charIndex, transcript.length, durationSeconds),
    }));
    const downloads = await getDownloads(ep.slug);

    groups.push({
      episodeSlug: ep.slug,
      episodeNumber: ep.episodeNumber,
      episodeTitle: ep.title,
      publishDate: ep.publishDate,
      durationSeconds,
      spotifyId: ep.spotifyId,
      downloads,
      mentions,
    });
    mentionCount += mentions.length;
    totalReach += downloads;
  }

  groups.sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  return { mentionCount, totalReach, groups };
}

export async function buildSponsorReport(
  sponsorId: string,
  month: string,
): Promise<ReportPayload | null> {
  const sponsors = await getSponsors();
  const sponsor = sponsors.find((s) => s.id === sponsorId);
  if (!sponsor) return null;

  const aliases = aliasesFor(sponsor.brandName, sponsor.brandAliases);

  const [current, prev, social, prevSocial, web, prevWeb] = await Promise.all([
    computeHeadlineCore(sponsorId, sponsor.brandName, aliases, month),
    computeHeadlineCore(sponsorId, sponsor.brandName, aliases, previousMonth(month)),
    getSocialStats(month),
    getSocialStats(previousMonth(month)),
    getMonthlyWebSessions(month),
    getMonthlyWebSessions(previousMonth(month)),
  ]);

  const sumSocial = (s: Record<string, number | null>): number | null => {
    const vals = [s.facebook, s.x, s.instagram];
    if (vals.every((v) => v === null)) return null;
    return vals.reduce((acc: number, v) => acc + (v ?? 0), 0);
  };

  const socialImpressions = sumSocial(social);
  const prevSocialImpressions = sumSocial(prevSocial);

  const platforms: PlatformStat[] = [
    { platform: 'website', views: web, deltaPct: pctDelta(web, prevWeb) },
    { platform: 'facebook', views: social.facebook, deltaPct: pctDelta(social.facebook, prevSocial.facebook) },
    { platform: 'x', views: social.x, deltaPct: pctDelta(social.x, prevSocial.x) },
    { platform: 'instagram', views: social.instagram, deltaPct: pctDelta(social.instagram, prevSocial.instagram) },
  ];

  return {
    sponsor: {
      id: sponsor.id,
      brandName: sponsor.brandName,
      logoUrl: sponsor.logoUrl,
      aliases,
    },
    month,
    generatedAt: new Date().toISOString(),
    headline: {
      mentionCount: current.mentionCount,
      totalReach: current.totalReach,
      webSessions: web,
      socialImpressions,
      deltas: {
        mentionCount: pctDelta(current.mentionCount, prev.mentionCount),
        totalReach: pctDelta(current.totalReach, prev.totalReach),
        webSessions: pctDelta(web, prevWeb),
        socialImpressions: pctDelta(socialImpressions, prevSocialImpressions),
      },
    },
    episodeGroups: current.groups,
    platforms,
  };
}
