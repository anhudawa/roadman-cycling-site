import {
  classifyMarketingAttribution,
  getMarketingCampaign,
  MARKETING_CHANNEL_LABELS,
  type AttributionTouch,
  type MarketingChannel,
} from "@/lib/marketing/attribution";

export interface MarketingApplication {
  status: string;
  attribution: Record<string, string> | null;
}

export interface MarketingSpendRecord {
  id?: number;
  spendDate?: string;
  channel: string;
  campaign: string | null;
  amountCents: number;
  currency: string;
  notes?: string | null;
  source?: string;
}

export interface MarketingPerformanceRow {
  key: string;
  channel: string;
  label: string;
  campaign: string | null;
  applications: number;
  signedUp: number;
  signUpRate: number | null;
  spendCents: number;
  costPerApplicationCents: number | null;
  costPerSignedUpCents: number | null;
}

export interface MarketingPerformance {
  totalApplications: number;
  signedUpApplications: number;
  trackedApplications: number;
  trackedShare: number | null;
  totalSpendCents: number;
  channels: MarketingPerformanceRow[];
  campaigns: MarketingPerformanceRow[];
  bestPaidChannel: MarketingPerformanceRow | null;
}

const CLIENT_STATUSES = new Set(["signed_up"]);

function channelLabel(channel: string) {
  return (
    MARKETING_CHANNEL_LABELS[channel as MarketingChannel] ??
    channel
      .split("_")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function makeRow(
  channel: string,
  campaign: string | null,
): MarketingPerformanceRow {
  return {
    key: campaign ? `${channel}:${campaign}` : channel,
    channel,
    label: channelLabel(channel),
    campaign,
    applications: 0,
    signedUp: 0,
    signUpRate: null,
    spendCents: 0,
    costPerApplicationCents: null,
    costPerSignedUpCents: null,
  };
}

function finaliseRow(row: MarketingPerformanceRow) {
  row.signUpRate =
    row.applications > 0 ? row.signedUp / row.applications : null;
  row.costPerApplicationCents =
    row.spendCents > 0 && row.applications > 0
      ? Math.round(row.spendCents / row.applications)
      : null;
  row.costPerSignedUpCents =
    row.spendCents > 0 && row.signedUp > 0
      ? Math.round(row.spendCents / row.signedUp)
      : null;
  return row;
}

export function buildMarketingPerformance(
  applications: MarketingApplication[],
  spend: MarketingSpendRecord[],
  touch: AttributionTouch,
): MarketingPerformance {
  const channelRows = new Map<string, MarketingPerformanceRow>();
  const campaignRows = new Map<string, MarketingPerformanceRow>();
  let trackedApplications = 0;
  let signedUpApplications = 0;

  for (const application of applications) {
    const channel = classifyMarketingAttribution(
      application.attribution,
      touch,
    );
    const campaign =
      getMarketingCampaign(application.attribution, touch) ?? null;
    const signedUp = CLIENT_STATUSES.has(application.status);
    if (channel !== "direct_unknown") trackedApplications += 1;
    if (signedUp) signedUpApplications += 1;

    const channelRow =
      channelRows.get(channel) ?? makeRow(channel, null);
    channelRow.applications += 1;
    if (signedUp) channelRow.signedUp += 1;
    channelRows.set(channel, channelRow);

    const campaignKey = `${channel}:${campaign ?? "Unlabelled"}`;
    const campaignRow =
      campaignRows.get(campaignKey) ??
      makeRow(channel, campaign ?? "Unlabelled");
    campaignRow.applications += 1;
    if (signedUp) campaignRow.signedUp += 1;
    campaignRows.set(campaignKey, campaignRow);
  }

  for (const entry of spend) {
    if (entry.currency.toUpperCase() !== "EUR") continue;
    const channelRow =
      channelRows.get(entry.channel) ?? makeRow(entry.channel, null);
    channelRow.spendCents += entry.amountCents;
    channelRows.set(entry.channel, channelRow);

    const campaign = entry.campaign?.trim() || "Unlabelled";
    const campaignKey = `${entry.channel}:${campaign}`;
    const campaignRow =
      campaignRows.get(campaignKey) ??
      makeRow(entry.channel, campaign);
    campaignRow.spendCents += entry.amountCents;
    campaignRows.set(campaignKey, campaignRow);
  }

  const channels = [...channelRows.values()]
    .map(finaliseRow)
    .sort(
      (a, b) =>
        b.applications - a.applications ||
        b.spendCents - a.spendCents ||
        a.label.localeCompare(b.label),
    );
  const campaigns = [...campaignRows.values()]
    .map(finaliseRow)
    .sort(
      (a, b) =>
        b.applications - a.applications ||
        b.spendCents - a.spendCents ||
        a.campaign!.localeCompare(b.campaign!),
    );
  const bestPaidChannel =
    channels
      .filter((row) => row.costPerSignedUpCents !== null)
      .sort(
        (a, b) =>
          a.costPerSignedUpCents! - b.costPerSignedUpCents! ||
          b.signedUp - a.signedUp,
      )[0] ?? null;

  return {
    totalApplications: applications.length,
    signedUpApplications,
    trackedApplications,
    trackedShare:
      applications.length > 0
        ? trackedApplications / applications.length
        : null,
    totalSpendCents: spend
      .filter((entry) => entry.currency.toUpperCase() === "EUR")
      .reduce((total, entry) => total + entry.amountCents, 0),
    channels,
    campaigns,
    bestPaidChannel,
  };
}
