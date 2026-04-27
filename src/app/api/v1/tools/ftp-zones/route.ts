import { NextResponse } from "next/server";
import { calculateFtpZones } from "@/lib/tools/calculators";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /api/v1/tools/ftp-zones?ftp=280[&lthr=170]
 *
 * Returns the 7-zone power table for the supplied FTP. If `lthr`
 * (lactate threshold heart rate, bpm) is supplied, each zone also
 * includes an estimated heart-rate range in bpm.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const ftpRaw = url.searchParams.get("ftp");
  const lthrRaw = url.searchParams.get("lthr");

  const ftp = ftpRaw ? parseFloat(ftpRaw) : NaN;
  const lthr = lthrRaw ? parseFloat(lthrRaw) : undefined;

  if (!Number.isFinite(ftp) || ftp <= 0) {
    return NextResponse.json(
      {
        error: "Missing or invalid required query parameter: ftp (watts, must be > 0)",
      },
      { status: 400 },
    );
  }
  if (ftp < 50 || ftp > 600) {
    return NextResponse.json(
      { error: "FTP must be between 50 and 600 watts" },
      { status: 400 },
    );
  }
  if (lthr !== undefined && (!Number.isFinite(lthr) || lthr < 80 || lthr > 220)) {
    return NextResponse.json(
      { error: "Invalid lthr; if supplied, must be between 80 and 220 bpm" },
      { status: 400 },
    );
  }

  const zones = calculateFtpZones(ftp, lthr);

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      tool: {
        slug: "ftp-zones",
        title: "FTP Zone Calculator",
        url: feedUrl("/tools/ftp-zones"),
      },
      input: { ftp, lthr: lthr ?? null },
      zones,
      methodology: {
        powerModel: "Coggan 7-zone (% of FTP)",
        heartRateModel: lthr ? "Friel-style % of LTHR" : null,
        notes: "Heart-rate ranges are estimates. Power is the primary control; HR drifts with heat, fatigue, and hydration.",
      },
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
