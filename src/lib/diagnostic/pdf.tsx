import {
  Document,
  // Aliased to keep eslint-plugin-jsx-a11y from treating react-pdf's
  // Image as an HTML <img> and requesting an alt prop the renderer
  // doesn't support.
  Image as PdfImage,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";
import { labelFor, CLOSE_TO_BREAKTHROUGH } from "./profiles";
import type { Breakdown, Profile } from "./types";

/**
 * Latin-extended → WinAnsi fallback. @react-pdf's built-in Helvetica
 * uses Windows-1252 encoding, which silently drops glyphs outside
 * that set (e.g. "Pogačar" loses the č). We stay on Helvetica
 * intentionally — custom font registration with @react-pdf is fragile
 * in serverless and the Work Sans TTF crashes fontkit's OpenType
 * processor at render time. This sanitiser swaps the handful of
 * characters that actually appear in our static breakdowns to ASCII
 * equivalents so the visible text stays correct.
 */
const GLYPH_FALLBACKS: Record<string, string> = {
  "č": "c", // č
  "Č": "C", // Č
  "ć": "c", // ć
  "Ć": "C", // Ć
  "ń": "n", // ń
  "ł": "l", // ł
  "Ł": "L", // Ł
  "ź": "z", // ź
  "ż": "z", // ż
  "ž": "z", // ž
  "Ž": "Z", // Ž
  "š": "s", // š
  "Š": "S", // Š
  "ő": "o", // ő
  "ű": "u", // ű
  "→": ">", // → rightwards arrow (not in WinAnsi)
  "←": "<", // ← leftwards arrow
};

function sanitiseForPdf(s: string): string {
  let out = "";
  for (const ch of s) out += GLYPH_FALLBACKS[ch] ?? ch;
  return out;
}

/**
 * Branded PDF for a Plateau Diagnostic result.
 *
 * Mirrors the paid-reports PDF posture: Helvetica only. Custom font
 * registration with @react-pdf/renderer at runtime is fragile and fails
 * silently in serverless — visual identity comes from colour, layout
 * and weight, not the typeface. Bebas Neue / Work Sans are the website
 * fonts; on PDF we use Helvetica-Bold (all-caps, tight) to read in the
 * same register.
 *
 * Colours from the brand bible:
 *   deep purple #210140, purple #4C1273, coral #F16363,
 *   charcoal #252526, off-white #FAFAFA, mid grey #545559.
 */

const NDY_URL = "https://www.skool.com/roadmancycling";

const styles = StyleSheet.create({
  // ── Cover ─────────────────────────────────────
  coverPage: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#FAFAFA",
    backgroundColor: "#210140",
  },
  coverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 64,
  },
  logo: {
    width: 96,
    height: "auto",
  },
  coverDate: {
    fontSize: 9,
    color: "#FAFAFA",
    opacity: 0.6,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  coverEyebrow: {
    fontSize: 10,
    color: "#F16363",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 18,
    fontFamily: "Helvetica-Bold",
  },
  coverProfileLabel: {
    fontSize: 22,
    color: "#FAFAFA",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 32,
  },
  coverHeadline: {
    fontSize: 32,
    color: "#FAFAFA",
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.1,
    marginBottom: 28,
  },
  coverDiagnosis: {
    fontSize: 13,
    color: "#FAFAFA",
    opacity: 0.92,
    lineHeight: 1.6,
    marginBottom: 24,
    fontFamily: "Helvetica",
  },
  coverCoralRule: {
    width: 64,
    height: 3,
    backgroundColor: "#F16363",
    marginBottom: 28,
  },
  coverMeta: {
    position: "absolute",
    bottom: 48,
    left: 48,
    right: 48,
    fontSize: 9,
    color: "#FAFAFA",
    opacity: 0.55,
    borderTopWidth: 1,
    borderTopColor: "#4C1273",
    paddingTop: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Body ─────────────────────────────────────
  page: {
    padding: 48,
    paddingBottom: 64,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#FAFAFA",
    backgroundColor: "#252526",
    lineHeight: 1.55,
  },
  bodyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#4C1273",
  },
  bodyHeaderLogo: {
    width: 64,
    height: "auto",
  },
  bodyHeaderEyebrow: {
    fontSize: 8,
    color: "#F16363",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  sectionEyebrow: {
    fontSize: 9,
    color: "#F16363",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FAFAFA",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    lineHeight: 1.15,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  paragraph: {
    marginBottom: 10,
    color: "#FAFAFA",
    opacity: 0.92,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
  },
  costingBox: {
    marginTop: 6,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#F16363",
    backgroundColor: "#210140",
  },
  costingEyebrow: {
    fontSize: 9,
    color: "#F16363",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  costingBody: {
    fontSize: 10.5,
    color: "#FAFAFA",
    lineHeight: 1.55,
    opacity: 0.95,
    fontFamily: "Helvetica",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#FAFAFA",
    opacity: 0.1,
    marginVertical: 22,
  },
  fixStep: {
    flexDirection: "row",
    marginBottom: 14,
  },
  fixStepNumber: {
    width: 36,
    fontSize: 28,
    color: "#F16363",
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },
  fixStepBody: {
    flex: 1,
    paddingLeft: 4,
  },
  fixStepTitle: {
    fontSize: 13,
    color: "#FAFAFA",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    lineHeight: 1.25,
  },
  fixStepDetail: {
    fontSize: 10.5,
    color: "#FAFAFA",
    opacity: 0.88,
    lineHeight: 1.55,
    fontFamily: "Helvetica",
  },

  // ── CTA ─────────────────────────────────────
  ctaCard: {
    marginTop: 12,
    padding: 18,
    backgroundColor: "#210140",
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#F16363",
  },
  ctaRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  ctaCopy: {
    flex: 1,
  },
  ctaEyebrow: {
    fontSize: 9,
    color: "#F16363",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  ctaTitle: {
    fontSize: 17,
    color: "#FAFAFA",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 8,
    lineHeight: 1.15,
  },
  ctaBody: {
    fontSize: 10.5,
    color: "#FAFAFA",
    opacity: 0.92,
    lineHeight: 1.55,
    marginBottom: 8,
    fontFamily: "Helvetica",
  },
  ctaPrice: {
    fontSize: 13,
    color: "#FAFAFA",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  ctaTrial: {
    fontSize: 9,
    color: "#F16363",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  ctaLink: {
    fontSize: 10,
    color: "#F16363",
    fontFamily: "Helvetica",
    textDecoration: "none",
  },
  anthonyHeadshot: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  anthonyCaption: {
    fontSize: 8,
    color: "#FAFAFA",
    opacity: 0.6,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 6,
    textAlign: "center",
  },

  // ── Footer ──────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#FAFAFA",
    opacity: 0.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#FAFAFA",
    paddingTop: 8,
  },
});

/**
 * Image loading — read once at module init. The files are tiny
 * (~10kb each) so the cost is trivial and we sidestep filesystem reads
 * from inside a render that could be hit dozens of times per minute.
 */
function loadImage(relPath: string): Buffer | null {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public", relPath));
  } catch (err) {
    console.warn(`[Diagnostic PDF] missing image ${relPath}:`, err);
    return null;
  }
}

const LOGO_WHITE = loadImage("images/logo-white.png");
const ANTHONY_HEADSHOT = loadImage(
  "images/about/anthony-profile-closeup-v2.jpg"
);

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface PdfInput {
  slug: string;
  primary: Profile;
  closeToBreakthrough: boolean;
  breakdown: Breakdown;
  createdAt: Date;
}

export function DiagnosticPdfDocument({ data }: { data: PdfInput }) {
  const raw = data.closeToBreakthrough
    ? CLOSE_TO_BREAKTHROUGH
    : data.breakdown;
  // Sanitise every visible string so glyphs WinAnsi-encoded Helvetica
  // can't render (č, →, etc.) don't silently drop. Cheap, idempotent
  // and runs once per render.
  const breakdown = {
    headline: sanitiseForPdf(raw.headline),
    diagnosis: sanitiseForPdf(raw.diagnosis),
    whyThisIsHappening: sanitiseForPdf(raw.whyThisIsHappening),
    whatItsCosting: sanitiseForPdf(raw.whatItsCosting),
    whyAlone: sanitiseForPdf(raw.whyAlone),
    nextMove: sanitiseForPdf(raw.nextMove),
    fix: raw.fix.map((s) => ({
      step: s.step,
      title: sanitiseForPdf(s.title),
      detail: sanitiseForPdf(s.detail),
    })),
  };
  const profileLabel = labelFor(data.primary, data.closeToBreakthrough);
  const dateLabel = formatDate(data.createdAt);
  const whyParas = breakdown.whyThisIsHappening.split("\n\n");

  return (
    <Document
      title={`Roadman Plateau Diagnostic — ${profileLabel}`}
      author="Roadman Cycling"
      subject={breakdown.headline}
      creator="Roadman Cycling"
    >
      {/* ── Cover ─────────────────────────────── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverHeader}>
          {LOGO_WHITE ? (
            <PdfImage style={styles.logo} src={LOGO_WHITE} />
          ) : (
            <Text style={{ ...styles.coverEyebrow, marginBottom: 0 }}>
              Roadman Cycling
            </Text>
          )}
          <Text style={styles.coverDate}>{dateLabel}</Text>
        </View>

        <Text style={styles.coverEyebrow}>Masters Plateau Diagnostic</Text>
        <Text style={styles.coverProfileLabel}>Your diagnosis · {profileLabel}</Text>

        <View style={styles.coverCoralRule} />

        <Text style={styles.coverHeadline}>{breakdown.headline}</Text>
        <Text style={styles.coverDiagnosis}>{breakdown.diagnosis}</Text>

        <Text style={styles.coverMeta}>
          Roadman Cycling · roadmancycling.com/diagnostic/{data.slug}
        </Text>
      </Page>

      {/* ── Body ─────────────────────────────── */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.bodyHeader} fixed>
          {LOGO_WHITE ? (
            <PdfImage style={styles.bodyHeaderLogo} src={LOGO_WHITE} />
          ) : (
            <Text style={styles.bodyHeaderEyebrow}>Roadman Cycling</Text>
          )}
          <Text style={styles.bodyHeaderEyebrow}>
            Your diagnosis · {profileLabel}
          </Text>
        </View>

        {/* Why this is happening */}
        <View wrap={false}>
          <Text style={styles.sectionEyebrow}>Why this is happening</Text>
          <Text style={styles.sectionTitle}>The pattern under the plateau</Text>
        </View>
        {whyParas.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}

        {/* What it's costing you */}
        <View style={styles.costingBox} wrap={false}>
          <Text style={styles.costingEyebrow}>What it&rsquo;s costing you</Text>
          <Text style={styles.costingBody}>{breakdown.whatItsCosting}</Text>
        </View>

        <View style={styles.divider} />

        {/* The fix */}
        <View wrap={false}>
          <Text style={styles.sectionEyebrow}>The fix</Text>
          <Text style={styles.sectionTitle}>Three things to change this week</Text>
        </View>
        {breakdown.fix.map((step) => (
          <View key={step.step} style={styles.fixStep} wrap={false}>
            <Text style={styles.fixStepNumber}>{step.step}</Text>
            <View style={styles.fixStepBody}>
              <Text style={styles.fixStepTitle}>{step.title}</Text>
              <Text style={styles.fixStepDetail}>{step.detail}</Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Why most riders can't do this alone */}
        <View wrap={false}>
          <Text style={styles.sectionEyebrow}>Why most riders can&rsquo;t do this alone</Text>
          <Text style={styles.sectionTitle}>The hardest part of the work</Text>
          <Text style={styles.paragraph}>{breakdown.whyAlone}</Text>
        </View>

        {/* CTA — Not Done Yet */}
        <View style={styles.ctaCard} wrap={false}>
          <View style={styles.ctaRow}>
            <View style={styles.ctaCopy}>
              <Text style={styles.ctaEyebrow}>Your next move</Text>
              <Text style={styles.ctaTitle}>Inside Not Done Yet</Text>
              <Text style={styles.ctaBody}>{breakdown.nextMove}</Text>
              <Text style={styles.ctaPrice}>
                $195 / month USD · cancel anytime
              </Text>
              <Text style={styles.ctaTrial}>7-day free trial</Text>
              <Link style={styles.ctaLink} src={NDY_URL}>
                {sanitiseForPdf(
                  `${NDY_URL.replace(/^https?:\/\//, "")} →`
                )}
              </Link>
            </View>
            {ANTHONY_HEADSHOT ? (
              <View>
                <PdfImage style={styles.anthonyHeadshot} src={ANTHONY_HEADSHOT} />
                <Text style={styles.anthonyCaption}>Anthony</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) => (
            `Roadman Cycling   ·   ${dateLabel}   ·   ${pageNumber}/${totalPages}`
          )}
        />
      </Page>
    </Document>
  );
}

/**
 * Render the diagnostic PDF to a Node Buffer. Dynamic import keeps
 * @react-pdf/renderer out of the cold-start path for any request that
 * doesn't actually need it.
 */
export async function renderDiagnosticPdf(data: PdfInput): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  return renderToBuffer(<DiagnosticPdfDocument data={data} />);
}

export function diagnosticPdfFilename(input: {
  primary: Profile;
  closeToBreakthrough: boolean;
  slug: string;
}): string {
  const label = labelFor(input.primary, input.closeToBreakthrough)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `roadman-plateau-diagnosis-${label}-${input.slug}.pdf`;
}
