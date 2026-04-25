import { ImageResponse } from "next/og";
import { getSubmissionBySlug } from "@/lib/diagnostic/store";
import { labelFor } from "@/lib/diagnostic/profiles";

export const alt = "Your Masters Plateau Diagnosis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic OG card for shared results pages. Pulls the assigned
 * profile so a "look at my diagnosis" tweet renders a rich card
 * with the profile name $€” more compelling than a generic share.
 *
 * Handled gracefully when the slug is invalid / expired: falls back
 * to the same card /plateau uses, with no PII leak.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const submission = slug ? await getSubmissionBySlug(slug) : null;

  const profileLabel = submission
    ? labelFor(submission.primaryProfile, submission.closeToBreakthrough)
    : "Twelve questions. Four minutes.";

  const headline = submission
    ? submission.breakdown.headline
    : "One specific answer for a stalled FTP.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          backgroundColor: "#252526",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #F16363, #4C1273)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, #210140 0%, #252526 50%, #252526 100%)",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: "#F16363",
              fontSize: "20px",
              letterSpacing: "4px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            {submission
              ? `YOUR DIAGNOSIS $· ${profileLabel.toUpperCase()}`
              : "THE MASTERS PLATEAU DIAGNOSTIC"}
          </span>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#F5F0EB",
              lineHeight: 1.1,
              marginBottom: "24px",
              maxWidth: "1000px",
            }}
          >
            {headline.length > 100 ? headline.slice(0, 100) + "$€¦" : headline}
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#A0A0A5",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            Find out which of four plateau profiles fits you $€” and the
            exact fix. Four minutes at roadmancycling.com/plateau.
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "0",
              color: "#F16363",
              fontSize: "18px",
              letterSpacing: "3px",
              fontWeight: 600,
            }}
          >
            ROADMAN CYCLING
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
