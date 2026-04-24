import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReportContent } from "./content";

/**
 * Brand-matched PDF document for a paid report.
 *
 * Uses Helvetica (built-in) intentionally — custom font registration
 * with @react-pdf/renderer at runtime is fragile and fails silently in
 * serverless. Visual identity comes from colour, layout, and typography
 * weighting, not the typeface.
 *
 * Colours pulled from the Roadman brand bible:
 *   deep purple #210140, purple #4C1273, coral #F16363, charcoal #252526,
 *   off-white #FAFAFA, mid grey #545559.
 */

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#252526",
    backgroundColor: "#FAFAFA",
    lineHeight: 1.5,
  },
  coverPage: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#FAFAFA",
    backgroundColor: "#210140",
  },
  coverEyebrow: {
    fontSize: 10,
    color: "#F16363",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 16,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    fontSize: 36,
    color: "#FAFAFA",
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.1,
    marginBottom: 24,
    textTransform: "uppercase",
  },
  coverSubtitle: {
    fontSize: 14,
    color: "#FAFAFA",
    opacity: 0.85,
    marginBottom: 48,
    lineHeight: 1.5,
  },
  coverPersonal: {
    fontSize: 12,
    color: "#F16363",
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  coverMeta: {
    position: "absolute",
    bottom: 48,
    left: 48,
    right: 48,
    fontSize: 9,
    color: "#FAFAFA",
    opacity: 0.6,
    borderTopWidth: 1,
    borderTopColor: "#4C1273",
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionEyebrow: {
    fontSize: 8,
    color: "#F16363",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 20,
    color: "#210140",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    lineHeight: 1.15,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 10,
    color: "#252526",
    lineHeight: 1.55,
  },
  bulletList: {
    marginTop: 6,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bulletMarker: {
    width: 14,
    color: "#F16363",
    fontFamily: "Helvetica-Bold",
  },
  bulletText: {
    flex: 1,
    color: "#252526",
    lineHeight: 1.5,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#545559",
    opacity: 0.2,
    marginVertical: 20,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#545559",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#545559",
    paddingTop: 8,
  },
  disclaimer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#FAFAFA",
    borderLeftWidth: 3,
    borderLeftColor: "#F16363",
    fontSize: 9,
    color: "#545559",
    lineHeight: 1.5,
  },
});

function SectionBlock({
  eyebrow,
  title,
  paragraphs,
  bullets,
}: {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}) {
  return (
    <View wrap={false} style={{ marginBottom: 24 }}>
      <View style={styles.sectionHeader}>
        {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      </View>
      {paragraphs.map((p, i) => (
        <Text key={i} style={styles.paragraph}>
          {p}
        </Text>
      ))}
      {bullets && bullets.length > 0 ? (
        <View style={styles.bulletList}>
          {bullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletMarker}>•</Text>
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ReportDocument({ content }: { content: ReportContent }) {
  const coverSection = content.sections.find((s) => s.kind === "cover");
  const bodySections = content.sections.filter((s) => s.kind !== "cover");

  const greeting = content.riderFirstName
    ? `For ${content.riderFirstName}`
    : "Your personalised report";

  const dateLabel = content.generatedAt.toISOString().slice(0, 10);

  return (
    <Document
      title={content.productName}
      author="Roadman Cycling"
      subject={content.summary}
    >
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverEyebrow}>Roadman Cycling · Paid Report</Text>
        <Text style={styles.coverTitle}>
          {coverSection?.title ?? content.productName}
        </Text>
        <Text style={styles.coverSubtitle}>
          {coverSection?.paragraphs[0] ?? content.toolTitle}
        </Text>
        <Text style={styles.coverPersonal}>{greeting.toUpperCase()}</Text>
        <Text style={{ color: "#FAFAFA", fontSize: 12, lineHeight: 1.6 }}>
          {content.summary}
        </Text>
        <Text style={styles.coverMeta}>
          Generated {dateLabel} · roadmancycling.com
        </Text>
      </Page>

      {/* Body */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.coverEyebrow}>{content.toolTitle}</Text>
        <Text style={{ fontSize: 11, color: "#545559", marginBottom: 24 }}>
          {content.summary}
        </Text>
        {bodySections.map((s, idx) => {
          const isDisclaimer = s.kind === "disclaimer";
          return (
            <View key={idx}>
              {isDisclaimer ? (
                <View style={styles.disclaimer}>
                  <Text
                    style={{
                      fontFamily: "Helvetica-Bold",
                      color: "#252526",
                      marginBottom: 4,
                      fontSize: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    {s.title}
                  </Text>
                  {s.paragraphs.map((p, i) => (
                    <Text key={i} style={{ color: "#545559" }}>
                      {p}
                    </Text>
                  ))}
                </View>
              ) : (
                <SectionBlock
                  eyebrow={sectionEyebrowFor(s.kind)}
                  title={s.title}
                  paragraphs={s.paragraphs}
                  bullets={s.bullets}
                />
              )}
              {idx < bodySections.length - 1 && !isDisclaimer ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          );
        })}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Roadman Cycling · ${content.productName} · page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

function sectionEyebrowFor(kind: string): string | undefined {
  const map: Record<string, string> = {
    summary: "The short answer",
    primary_limiter: "Your primary limiter",
    secondary_limiter: "Queue up next",
    next_12_weeks: "The plan",
    week_by_week: "Your week",
    fuelling_plan: "Fuelling",
    zones_plan: "Zones",
    recovery_plan: "Recovery",
    risk_addendum: "Watch-outs",
    ask_roadman: "Keep going",
    community_invite: "The room",
  };
  return map[kind];
}

export const GENERATOR_VERSION = "v1.0.0";
