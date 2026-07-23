import { NextResponse } from 'next/server'
import {
  getSponsor,
  getSponsorPerformance,
  getSponsorContent,
  parseSponsorDeliverables,
} from '@/lib/queries/sponsor-performance'

/**
 * GET /api/reports/sponsor/[id]
 * Generates a branded HTML report for a sponsor.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const [sponsor, performance, content] = await Promise.all([
    getSponsor(params.id),
    getSponsorPerformance(params.id),
    getSponsorContent(params.id),
  ])

  if (!sponsor) {
    return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
  }

  const deliverables = parseSponsorDeliverables(sponsor)
  const deliveredCount = deliverables.filter(
    (d) => d.status === 'delivered' || d.status === 'completed',
  ).length
  const progressPercent = deliverables.length > 0
    ? Math.round((deliveredCount / deliverables.length) * 100)
    : 0

  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return String(n)
  }

  function formatCurrency(cents: number): string {
    return `&pound;${(cents / 100).toFixed(2)}`
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sponsor Report — ${sponsor.name} — Roadman Cycling</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      background: #FAFAFA;
      color: #252526;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #210140;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #210140;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .header .brand {
      font-size: 14px;
      color: #F16363;
      font-weight: 600;
    }

    .header .date {
      font-size: 12px;
      color: #545559;
      margin-top: 4px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section h2 {
      font-size: 14px;
      font-weight: 600;
      color: #210140;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: #F0EDF5;
      border-radius: 8px;
      padding: 16px;
    }

    .metric-card .label {
      font-size: 11px;
      color: #545559;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .metric-card .value {
      font-size: 20px;
      font-weight: 700;
      color: #210140;
    }

    .progress-bar {
      background: #E5E5E5;
      border-radius: 6px;
      height: 10px;
      overflow: hidden;
      margin: 8px 0;
    }

    .progress-fill {
      background: #F16363;
      height: 100%;
      border-radius: 6px;
    }

    .progress-label {
      font-size: 12px;
      color: #545559;
      display: flex;
      justify-content: space-between;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    th {
      text-align: left;
      font-weight: 600;
      color: #545559;
      font-size: 11px;
      text-transform: uppercase;
      padding: 8px 12px;
      border-bottom: 2px solid #E5E5E5;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #F0F0F0;
      color: #252526;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .badge-green { background: #D1FAE5; color: #065F46; }
    .badge-amber { background: #FEF3C7; color: #92400E; }
    .badge-grey { background: #F3F4F6; color: #4B5563; }
    .badge-red { background: #FEE2E2; color: #991B1B; }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E5E5;
      text-align: center;
      font-size: 11px;
      color: #545559;
    }

    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${sponsor.name}</h1>
      <p class="brand">Roadman Cycling — Sponsor Report</p>
      <p class="date">${reportDate}</p>
    </div>
  </div>

  <!-- Performance Summary -->
  <div class="section">
    <h2>Performance Summary</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="label">Total Views</div>
        <div class="value">${formatNumber(performance.totalViews)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Engagement</div>
        <div class="value">${formatNumber(performance.totalEngagement)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Impressions</div>
        <div class="value">${formatNumber(performance.totalImpressions)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Reach</div>
        <div class="value">${formatNumber(performance.totalReach)}</div>
      </div>
      ${sponsor.deal_value_cents ? `
      <div class="metric-card">
        <div class="label">Deal Value</div>
        <div class="value">${formatCurrency(sponsor.deal_value_cents)}</div>
      </div>
      ` : ''}
    </div>
  </div>

  ${deliverables.length > 0 ? `
  <!-- Deliverables -->
  <div class="section">
    <h2>Deliverables</h2>
    <div class="progress-label">
      <span>Progress</span>
      <span>${deliveredCount} / ${deliverables.length} (${progressPercent}%)</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${progressPercent}%"></div>
    </div>
    <table style="margin-top: 16px;">
      <thead>
        <tr>
          <th>Deliverable</th>
          <th>Status</th>
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>
        ${deliverables.map((d) => `
        <tr>
          <td>${d.name}</td>
          <td>
            <span class="badge ${d.status === 'delivered' || d.status === 'completed' ? 'badge-green' : d.status === 'in_progress' ? 'badge-amber' : d.status === 'overdue' ? 'badge-red' : 'badge-grey'}">
              ${d.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          </td>
          <td>${d.dueDate ?? '—'}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${content.length > 0 ? `
  <!-- Content -->
  <div class="section">
    <h2>Content</h2>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th style="text-align: right;">Views</th>
          <th style="text-align: right;">Engagement</th>
          <th>Published</th>
        </tr>
      </thead>
      <tbody>
        ${content.map((item) => `
        <tr>
          <td>${item.title}</td>
          <td>${item.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</td>
          <td style="text-align: right;">${formatNumber(item.views)}</td>
          <td style="text-align: right;">${formatNumber(item.engagement)}</td>
          <td>${item.publishDate ?? '—'}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="footer">
    <p>This report was generated by Roadman OS on ${reportDate}.</p>
    <p>Roadman Cycling &mdash; Not Done Yet.</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
