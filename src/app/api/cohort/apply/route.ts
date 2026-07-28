import { NextResponse } from "next/server";
import { and, eq, isNull, ne, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
import { notifyCohortApplication, sendApplicantConfirmation } from "@/lib/notifications";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { getCohortState } from "@/lib/cohort";
import { rateLimitOr429 } from "@/lib/rate-limit/ip-rate-limit";
import {
  clampString,
  LIMITS,
  normaliseEmail,
} from "@/lib/validation";

const ATTRIBUTION_FIELDS = new Set([
  "landingPath",
  "referrer",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "aiReferrer",
  "capturedAt",
]);

function sanitiseAttribution(
  input: unknown,
): Record<string, string> | null | undefined {
  if (input == null) return undefined;
  if (typeof input !== "object" || Array.isArray(input)) return null;

  const clean: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(
    input as Record<string, unknown>,
  )) {
    if (!ATTRIBUTION_FIELDS.has(key) || typeof rawValue !== "string") {
      return null;
    }
    const value = clampString(rawValue, 500);
    if (value) clean[key] = value;
  }

  if (clean.landingPath && !clean.landingPath.startsWith("/")) return null;
  if (
    clean.referrer &&
    !/^https?:\/\//i.test(clean.referrer)
  ) {
    return null;
  }
  return clean;
}

export async function POST(request: Request) {
  const limited = await rateLimitOr429(request, {
    namespace: "coaching-application",
    tokens: 5,
    window: "10 m",
  });
  if (limited) return limited;

  try {
    let body: Record<string, unknown>;
    try {
      const parsed = (await request.json()) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid request body");
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Please submit a valid application." },
        { status: 400 },
      );
    }

    // Quietly absorb bot submissions that fill the off-screen honeypot.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ success: true, discarded: true });
    }

    const name = clampString(body.name, LIMITS.name);
    const email = normaliseEmail(body.email);
    const goal = clampString(body.goal, LIMITS.shortText);
    const hours = clampString(body.hours, 50);
    const frustration = clampString(body.frustration, LIMITS.shortText);
    const ftp =
      body.ftp == null || body.ftp === ""
        ? null
        : clampString(body.ftp, 50);
    const triedBefore =
      body.triedBefore == null || body.triedBefore === ""
        ? null
        : clampString(body.triedBefore, LIMITS.longText);
    const whyInnerCircle =
      body.whyInnerCircle == null || body.whyInnerCircle === ""
        ? null
        : clampString(body.whyInnerCircle, LIMITS.longText);
    const cohortOverride = body.cohort;
    const suppliedSubmissionKey =
      body.submissionId == null
        ? null
        : clampString(body.submissionId, 100);
    const attribution = sanitiseAttribution(body.attribution);

    if (!name || !email || !goal || !hours || !frustration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    if (body.ftp != null && body.ftp !== "" && !ftp) {
      return NextResponse.json(
        { error: "Please enter a valid FTP value." },
        { status: 400 },
      );
    }
    if (
      body.submissionId != null &&
      (!suppliedSubmissionKey ||
        !/^[A-Za-z0-9_-]{8,100}$/.test(suppliedSubmissionKey))
    ) {
      return NextResponse.json(
        { error: "Invalid submission identifier." },
        { status: 400 },
      );
    }
    if (attribution === null) {
      return NextResponse.json(
        { error: "Invalid application attribution." },
        { status: 400 },
      );
    }

    // A stable client key makes retries idempotent while still allowing the
    // same rider to submit a genuinely new application in the future.
    const submissionKey = suppliedSubmissionKey ?? crypto.randomUUID();

    // Simple persona classification from answers
    let persona = "listener";
    const frustrationLower = frustration.toLowerCase();
    const goalLower = goal.toLowerCase();

    if (
      frustrationLower.includes("plateau") ||
      frustrationLower.includes("stuck") ||
      frustrationLower.includes("number")
    ) {
      persona = "plateau";
    } else if (
      goalLower.includes("race") ||
      goalLower.includes("event") ||
      goalLower.includes("etape") ||
      goalLower.includes("sportive")
    ) {
      persona = "event-prep";
    } else if (
      frustrationLower.includes("motivation") ||
      frustrationLower.includes("comeback") ||
      frustrationLower.includes("injury") ||
      frustrationLower.includes("break")
    ) {
      persona = "comeback";
    }

    const normalisedEmail = email;

    // Inner Circle applications come through the same endpoint but get a
    // distinct label so the admin Kanban filters them into their own column.
    const isInnerCircle =
      typeof cohortOverride === "string" && cohortOverride.trim() === "inner-circle";
    const cohortState = getCohortState();
    const cohortLabel = isInnerCircle ? "inner-circle" : "ndy";

    // Inner Circle has two extra free-form questions that don't have
    // their own DB columns. Fold them into the frustration field as
    // labelled sections so they render cleanly in the admin detail view.
    const frustrationStored = isInnerCircle
      ? [
          frustration,
          triedBefore && `\n\nWhat I've tried before:\n${triedBefore}`,
          whyInnerCircle && `\n\nWhy Inner Circle:\n${whyInnerCircle}`,
        ]
          .filter(Boolean)
          .join("")
      : frustration;

    // Frustration column is text but the validator above caps everything
    // sensibly. Inner Circle's combined frustration text can be longer
    // than the original 500-char clamp, so give it more headroom.
    const frustrationLimit = isInnerCircle ? 4000 : 500;

    const applicationValues = {
      name,
      email: normalisedEmail,
      goal,
      hours,
      ftp,
      frustration: frustrationStored.slice(0, frustrationLimit),
      cohort: cohortLabel,
      persona,
      submissionKey,
      attribution,
    };

    // The unique index makes the first application the only request allowed
    // to trigger CRM and email side effects. A repeat safely refreshes the
    // stored answers but does not create another activity or burn email quota.
    const inserted = await db
      .insert(cohortApplications)
      .values(applicationValues)
      .onConflictDoNothing({
        target: [cohortApplications.email, cohortApplications.cohort],
      })
      .returning({ id: cohortApplications.id });

    let reapplication = false;
    if (inserted.length === 0) {
      const updated = await db
        .update(cohortApplications)
        .set({
          name,
          goal,
          hours,
          ftp,
          frustration: frustrationStored.slice(0, frustrationLimit),
          persona,
          submissionKey,
          attribution,
          status: "awaiting_response",
          readAt: null,
          createdAt: new Date(),
        })
        .where(
          and(
            eq(cohortApplications.email, normalisedEmail),
            eq(cohortApplications.cohort, cohortLabel),
            or(
              isNull(cohortApplications.submissionKey),
              ne(cohortApplications.submissionKey, submissionKey),
            ),
          ),
        )
        .returning({ id: cohortApplications.id });

      if (updated.length === 0) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          persona,
          phase: isInnerCircle ? "inner-circle" : cohortState.phase,
          cohort: cohortLabel,
        });
      }
      reapplication = true;
    }

    const sourceLabel = isInnerCircle
      ? "inner_circle_application"
      : "cohort_application";
    const activityTitle = isInnerCircle
      ? `${reapplication ? "Reapplied" : "Applied"} to Inner Circle (${persona})`
      : `${reapplication ? "Reapplied" : "Applied"} to Not Done Yet (${persona})`;

    // CRM: upsert contact + activity (non-fatal)
    try {
      const contact = await upsertContact({
        email: normalisedEmail,
        name,
        source: sourceLabel,
        customFields: {
          goal,
          hours,
          ftp: ftp || null,
          frustration: frustrationStored,
          cohort: cohortLabel,
          persona,
          phase: isInnerCircle ? "inner-circle" : cohortState.phase,
          attribution: attribution ?? null,
        },
      });
      await addActivity(contact.id, {
        type: sourceLabel,
        title: activityTitle,
        body: `Goal: ${goal}\n\nHours/week: ${hours}\n\nFTP: ${ftp || "n/a"}\n\n${frustrationStored}`,
        meta: {
          goal,
          hours,
          ftp: ftp || null,
          frustration: frustrationStored,
          persona,
          cohort: cohortLabel,
          phase: isInnerCircle ? "inner-circle" : cohortState.phase,
          attribution: attribution ?? null,
        },
        authorName: "system",
      });
    } catch (crmErr) {
      console.error("[Cohort Apply] CRM sync failed:", crmErr);
    }

    // Complete the transactional emails before returning. Serverless
    // runtimes may terminate unawaited work as soon as the response is sent.
    const [adminNotification, applicantConfirmation] =
      await Promise.allSettled([
        notifyCohortApplication({
          name,
          email: normalisedEmail,
          goal,
          hours,
          ftp,
          frustration: frustrationStored,
          persona,
          isInnerCircle,
          attribution,
        }),
        sendApplicantConfirmation({
          name,
          email: normalisedEmail,
          isInnerCircle,
        }),
      ]);

    if (adminNotification.status === "rejected") {
      console.error(
        "[Cohort Apply] Admin notification failed:",
        adminNotification.reason,
      );
    } else if (!adminNotification.value.success) {
      console.error(
        "[Cohort Apply] Admin notification failed:",
        adminNotification.value.error ?? "Unknown email delivery failure",
      );
    }
    if (applicantConfirmation.status === "rejected") {
      console.error(
        "[Cohort Apply] Applicant confirmation failed:",
        applicantConfirmation.reason,
      );
    } else if (!applicantConfirmation.value.success) {
      console.error(
        "[Cohort Apply] Applicant confirmation failed:",
        applicantConfirmation.value.error ?? "Unknown email delivery failure",
      );
    }

    return NextResponse.json({
      success: true,
      reapplication,
      persona,
      phase: isInnerCircle ? "inner-circle" : cohortState.phase,
      cohort: cohortLabel,
    });
  } catch (error) {
    console.error("[Cohort Apply] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
