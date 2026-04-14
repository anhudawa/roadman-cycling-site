import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { buildSponsorReport } from '@/lib/reports/sponsor-report';
import { SponsorReportPDF } from '@/components/admin/reports/pdf/SponsorReportPDF';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sponsorId: string; month: string }> },
) {
  const { sponsorId, month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return new Response('Invalid month', { status: 400 });
  }
  const payload = await buildSponsorReport(sponsorId, month);
  if (!payload) return new Response('Sponsor not found', { status: 404 });

  const buffer = await renderToBuffer(<SponsorReportPDF payload={payload} />);
  const filename = `${payload.sponsor.brandName.replace(/\s+/g, '-').toLowerCase()}-${month}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
