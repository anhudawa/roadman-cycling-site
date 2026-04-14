import { notFound } from 'next/navigation';
import { buildSponsorReport } from '@/lib/reports/sponsor-report';
import { SponsorReport } from '@/components/admin/reports/SponsorReport';

interface Params {
  params: Promise<{ sponsorId: string; month: string }>;
}

export const revalidate = 3600;

export default async function Page({ params }: Params) {
  const { sponsorId, month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) notFound();

  const payload = await buildSponsorReport(sponsorId, month);
  if (!payload) notFound();

  return <SponsorReport payload={payload} showSocialForm={true} />;
}
