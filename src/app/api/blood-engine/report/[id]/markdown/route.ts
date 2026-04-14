import { NextResponse } from "next/server";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { getReport } from "@/lib/blood-engine/db";
import { renderReportMarkdown } from "@/lib/blood-engine/report-markdown";

/**
 * Markdown export of a single report — "bring to your GP" format.
 *
 *   GET /api/blood-engine/report/[id]/markdown
 *
 * Auth-gated + owner-scoped via getReport(). Returns text/markdown as an
 * attachment download.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireBloodEngineAccess();
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId) || reportId <= 0) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }
  const report = await getReport(reportId, user.id);
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const md = renderReportMarkdown(report);
  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="blood-engine-report-${reportId}.md"`,
      "Cache-Control": "no-store",
    },
  });
}
