import type { ReportPayload } from '@/lib/reports/types';
import { ReportHero } from './ReportHero';
import { HeadlineStats } from './HeadlineStats';
import { MentionsTimeline } from './MentionsTimeline';
import { AudiencePanel } from './AudiencePanel';
import { SocialStatsForm } from './SocialStatsForm';

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

interface Props {
  payload: ReportPayload;
  showSocialForm: boolean;
}

export function SponsorReport({ payload, showSocialForm }: Props) {
  const { sponsor, month, headline, episodeGroups, platforms } = payload;
  const social = {
    facebook: platforms.find((p) => p.platform === 'facebook')?.views ?? null,
    x: platforms.find((p) => p.platform === 'x')?.views ?? null,
    instagram: platforms.find((p) => p.platform === 'instagram')?.views ?? null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#210140] to-[#252526] text-white">
      <div className="mx-auto max-w-5xl px-6">
        <ReportHero
          brandName={sponsor.brandName}
          logoUrl={sponsor.logoUrl}
          monthLabel={monthLabel(month)}
        />
        <HeadlineStats
          stats={[
            { label: 'Brand Mentions', value: headline.mentionCount, deltaPct: headline.deltas.mentionCount },
            { label: 'Episode Reach', value: headline.totalReach, deltaPct: headline.deltas.totalReach },
            { label: 'Web Sessions', value: headline.webSessions, deltaPct: headline.deltas.webSessions },
            { label: 'Social Impressions', value: headline.socialImpressions, deltaPct: headline.deltas.socialImpressions },
          ]}
        />
        <MentionsTimeline groups={episodeGroups} />
        <AudiencePanel platforms={platforms} />
        {showSocialForm && (
          <div className="py-6">
            <SocialStatsForm
              sponsorId={sponsor.id}
              month={month}
              initial={social}
            />
          </div>
        )}
        <footer className="flex items-center justify-between border-t border-white/10 py-10 text-sm text-white/50">
          <span>Generated {new Date(payload.generatedAt).toLocaleString('en-GB')}</span>
          <a
            href={`/admin/inventory/sponsors/${sponsor.id}/reports/${month}/pdf`}
            className="rounded-md bg-[#F16363] px-4 py-2 font-semibold text-white hover:bg-[#e14d4d]"
          >
            Download PDF
          </a>
        </footer>
      </div>
    </div>
  );
}
