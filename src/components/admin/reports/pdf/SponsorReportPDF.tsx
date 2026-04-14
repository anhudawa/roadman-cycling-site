import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer';
import type { ReportPayload } from '@/lib/reports/types';
import { formatTimestamp } from '@/lib/reports/timestamp';

const styles = StyleSheet.create({
  page: { backgroundColor: '#210140', color: '#ffffff', padding: 40, fontSize: 11 },
  heroLogo: { width: 140, height: 70, objectFit: 'contain', marginBottom: 12, alignSelf: 'center' },
  heroTitle: { fontSize: 32, textAlign: 'center', marginBottom: 4 },
  heroSub: { fontSize: 10, color: '#cccccc', textAlign: 'center', letterSpacing: 2 },
  hr: { height: 2, backgroundColor: '#F16363', width: 60, alignSelf: 'center', marginVertical: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { width: '48%', padding: 10, backgroundColor: '#ffffff11', borderRadius: 6 },
  statValue: { fontSize: 24, color: '#ffffff' },
  statLabel: { fontSize: 9, color: '#ffffff99', letterSpacing: 1, marginTop: 2 },
  h2: { fontSize: 18, marginTop: 16, marginBottom: 8 },
  epCard: { marginBottom: 10, padding: 10, backgroundColor: '#ffffff0d', borderRadius: 6 },
  epTitle: { fontSize: 12, color: '#ffffff', marginBottom: 4 },
  epMeta: { fontSize: 9, color: '#ffffff99', marginBottom: 4 },
  mention: { fontSize: 9, color: '#ffffffcc', marginBottom: 2 },
  ts: { color: '#F16363', fontFamily: 'Courier' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#ffffff66', textAlign: 'center' },
});

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function SponsorReportPDF({ payload }: { payload: ReportPayload }) {
  const { sponsor, month, headline, episodeGroups, platforms } = payload;
  const fmt = (v: number | null) => (v === null ? '—' : v.toLocaleString('en-GB'));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sponsor.logoUrl && <Image src={sponsor.logoUrl} style={styles.heroLogo} />}
        <Text style={styles.heroTitle}>{sponsor.brandName}</Text>
        <Text style={styles.heroSub}>MONTHLY PARTNERSHIP REPORT — {monthLabel(month).toUpperCase()}</Text>
        <View style={styles.hr} />

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(headline.mentionCount)}</Text>
            <Text style={styles.statLabel}>BRAND MENTIONS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(headline.totalReach)}</Text>
            <Text style={styles.statLabel}>EPISODE REACH</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(headline.webSessions)}</Text>
            <Text style={styles.statLabel}>WEB SESSIONS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(headline.socialImpressions)}</Text>
            <Text style={styles.statLabel}>SOCIAL IMPRESSIONS</Text>
          </View>
        </View>

        <Text style={styles.h2}>Podcast Mentions</Text>
        {episodeGroups.length === 0 ? (
          <Text style={styles.mention}>No mentions this month.</Text>
        ) : (
          episodeGroups.map((g) => (
            <View key={g.episodeSlug} style={styles.epCard}>
              <Text style={styles.epTitle}>Ep {g.episodeNumber} — {g.episodeTitle}</Text>
              <Text style={styles.epMeta}>
                {g.publishDate} · {g.mentions.length} mention(s) · {g.downloads.toLocaleString('en-GB')} downloads
              </Text>
              {g.mentions.map((m, i) => (
                <Text key={i} style={styles.mention}>
                  <Text style={styles.ts}>{formatTimestamp(m.timestampSeconds)}</Text> — “{m.quote}”
                </Text>
              ))}
            </View>
          ))
        )}

        <Text style={styles.h2}>Audience</Text>
        <View style={styles.statsGrid}>
          {platforms.map((p) => (
            <View key={p.platform} style={styles.statCard}>
              <Text style={styles.statValue}>{fmt(p.views)}</Text>
              <Text style={styles.statLabel}>{p.platform.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated {new Date(payload.generatedAt).toLocaleString('en-GB')} — Roadman Cycling
        </Text>
      </Page>
    </Document>
  );
}
