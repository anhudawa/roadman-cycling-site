// src/lib/reports/types.ts

export interface Mention {
  alias: string;        // the exact alias matched, as it appears in aliases list
  charIndex: number;    // position in the transcript blob
  quote: string;        // ~10-15 words of surrounding context, trimmed
  timestampSeconds: number; // approximated from char index + duration
}

export interface EpisodeMentionGroup {
  episodeSlug: string;
  episodeNumber: number;
  episodeTitle: string;
  publishDate: string;            // ISO
  durationSeconds: number;
  spotifyId?: string;
  downloads: number;
  mentions: Mention[];
}

export interface PlatformStat {
  platform: 'website' | 'facebook' | 'x' | 'instagram';
  views: number | null;           // null = not entered yet
  deltaPct: number | null;        // vs previous month, null if no history
}

export interface ReportPayload {
  sponsor: {
    id: string;
    brandName: string;
    logoUrl: string | null;
    aliases: string[];
  };
  month: string;                  // 'YYYY-MM'
  generatedAt: string;            // ISO
  headline: {
    mentionCount: number;
    totalReach: number;           // sum of downloads across mentioning episodes
    webSessions: number | null;
    socialImpressions: number | null;
    deltas: {
      mentionCount: number | null;
      totalReach: number | null;
      webSessions: number | null;
      socialImpressions: number | null;
    };
  };
  episodeGroups: EpisodeMentionGroup[];
  platforms: PlatformStat[];
}
