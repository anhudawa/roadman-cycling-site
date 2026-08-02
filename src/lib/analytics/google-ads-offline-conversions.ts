import { createHash } from "node:crypto";
import {
  classifyMarketingAttribution,
  getAttributionTouch,
  getMarketingCampaign,
} from "@/lib/marketing/attribution";

export const GOOGLE_ADS_COACHING_CAMPAIGN = "coaching_search_ie_uk_us";
export const GOOGLE_ADS_APPLICATION_ACTION = "NDY Application";
export const GOOGLE_ADS_SIGNED_UP_ACTION = "NDY Signed Up";

export interface GoogleAdsApplicationRecord {
  id: number;
  email: string;
  attribution: Record<string, string> | null;
  status: string;
  signedUpAt: Date | null;
  createdAt: Date;
}

export interface GoogleAdsConversionRow {
  googleClickId: string;
  gbraid: string;
  wbraid: string;
  conversionName: string;
  conversionTime: string;
  email: string;
  orderId: string;
  adUserData: string;
  adPersonalization: string;
}

function consentValue(value: string | undefined): "Granted" | "Denied" | "" {
  if (value?.toLowerCase() === "granted") return "Granted";
  if (value?.toLowerCase() === "denied") return "Denied";
  return "";
}

function normaliseAndHashEmail(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

function formatConversionTime(date: Date) {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "+00:00");
}

function rowFor(
  application: GoogleAdsApplicationRecord,
  conversionName: string,
  conversionTime: Date,
  orderId: string,
): GoogleAdsConversionRow {
  const attribution = application.attribution;
  const touch = getAttributionTouch(attribution, "last");
  const adUserData = consentValue(attribution?.adUserDataConsent);
  const adPersonalization = consentValue(
    attribution?.adPersonalizationConsent,
  );

  return {
    googleClickId: touch.gclid ?? "",
    gbraid: touch.gbraid ?? "",
    wbraid: touch.wbraid ?? "",
    conversionName,
    conversionTime: formatConversionTime(conversionTime),
    email:
      adUserData === "Granted" ? normaliseAndHashEmail(application.email) : "",
    orderId,
    adUserData,
    adPersonalization,
  };
}

export function isGoogleCoachingApplication(
  application: GoogleAdsApplicationRecord,
) {
  const attribution = application.attribution;
  const touch = getAttributionTouch(attribution, "last");
  return (
    classifyMarketingAttribution(attribution, "last") === "google_ads" &&
    getMarketingCampaign(attribution, "last") ===
      GOOGLE_ADS_COACHING_CAMPAIGN &&
    Boolean(touch.gclid || touch.gbraid || touch.wbraid)
  );
}

export function buildGoogleAdsConversionRows(
  applications: GoogleAdsApplicationRecord[],
  options: { since?: Date } = {},
) {
  const rows: GoogleAdsConversionRow[] = [];

  for (const application of applications) {
    if (!isGoogleCoachingApplication(application)) continue;

    if (!options.since || application.createdAt >= options.since) {
      rows.push(
        rowFor(
          application,
          GOOGLE_ADS_APPLICATION_ACTION,
          application.createdAt,
          `ndy-application-${application.id}`,
        ),
      );
    }

    if (
      application.status === "signed_up" &&
      application.signedUpAt &&
      (!options.since || application.signedUpAt >= options.since)
    ) {
      rows.push(
        rowFor(
          application,
          GOOGLE_ADS_SIGNED_UP_ACTION,
          application.signedUpAt,
          `ndy-signed-up-${application.id}`,
        ),
      );
    }
  }

  return rows;
}

const CSV_HEADERS: Record<keyof GoogleAdsConversionRow, string> = {
  googleClickId: "Google Click ID",
  gbraid: "GBRAID",
  wbraid: "WBRAID",
  conversionName: "Conversion Name",
  conversionTime: "Conversion Time",
  email: "Email",
  orderId: "Order ID",
  adUserData: "Ad User Data",
  adPersonalization: "Ad Personalization",
};

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function googleAdsConversionsToCsv(rows: GoogleAdsConversionRow[]) {
  const keys = Object.keys(CSV_HEADERS) as Array<keyof GoogleAdsConversionRow>;
  return [
    keys.map((key) => CSV_HEADERS[key]).join(","),
    ...rows.map((row) => keys.map((key) => csvCell(row[key])).join(",")),
  ].join("\n");
}
