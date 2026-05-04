import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
import { notifyCohortApplication, sendApplicantConfirmation } from "@/lib/notifications";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { getCohortState } from "@/lib/cohort";
import { EMAIL_REGEX } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      goal,
      hours,
      ftp,
      frustration,
      triedBefore,
      whyInnerCircle,
      cohort: cohortOverride,
    } = body;

    // Basic validation
    if (!name || !email || !goal || !hours || !frustration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

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

    const normalisedEmail = email.trim().toLowerCase();

    // Inner Circle applications come through the same endpoint but get a
    // distinct cohort label so the admin Kanban filters them into their
    // own column. Anything else falls back to the live cohort state.
    const isInnerCircle =
      typeof cohortOverride === "string" && cohortOverride.trim() === "inner-circle";
    const cohortState = getCohortState();
    const cohortLabel = isInnerCircle
      ? "inner-circle"
      : `cohort-${cohortState.targetCohort}`;

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

    // Idempotent by (email, cohort): re-submitting the form updates the
    // existing row rather than creating a duplicate. Matches the
    // uniqueIndex on cohort_applications(email, cohort) in schema.ts.
    await db
      .insert(cohortApplications)
      .values({
        name: name.slice(0, 200),
        email: normalisedEmail.slice(0, 200),
        goal: goal.slice(0, 500),
        hours: hours.slice(0, 50),
        ftp: ftp ? ftp.slice(0, 50) : null,
        frustration: frustrationStored.slice(0, frustrationLimit),
        cohort: cohortLabel,
        persona,
      })
      .onConflictDoUpdate({
        target: [cohortApplications.email, cohortApplications.cohort],
        set: {
          name: name.slice(0, 200),
          goal: goal.slice(0, 500),
          hours: hours.slice(0, 50),
          ftp: ftp ? ftp.slice(0, 50) : null,
          frustration: frustrationStored.slice(0, frustrationLimit),
          persona,
        },
      });

    const sourceLabel = isInnerCircle
      ? "inner_circle_application"
      : cohortState.phase === "waitlist"
        ? "cohort_waitlist"
        : "cohort_application";
    const activityTitle = isInnerCircle
      ? `Applied to Inner Circle (${persona})`
      : cohortState.phase === "waitlist"
        ? `Joined ${cohortLabel} waitlist (${persona})`
        : `Applied to ${cohortLabel} (${persona})`;

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
        },
        authorName: "system",
      });
    } catch (crmErr) {
      console.error("[Cohort Apply] CRM sync failed:", crmErr);
    }

    // Beehiiv: upsert subscriber + tag.
    //   Inner Circle             → "inner-circle-applicant"
    //   open / closing-today     → "cohort-N-applicant"
    //   waitlist                 → "cohort-N-waitlist"
    // Non-fatal — application still succeeds if Beehiiv is down.
    const beehiivTag = isInnerCircle
      ? "inner-circle-applicant"
      : cohortState.submissionTag;
    subscribeToBeehiiv({
      email: normalisedEmail,
      name,
      tags: [beehiivTag, `persona-${persona}`],
      customFields: {
        goal,
        hours,
        ftp: ftp || null,
        frustration: frustrationStored,
        cohort: cohortLabel,
        persona,
        phase: isInnerCircle ? "inner-circle" : cohortState.phase,
      },
      utm: {
        source: "site",
        medium: isInnerCircle
          ? "inner-circle-application"
          : cohortState.phase === "waitlist"
            ? "cohort-waitlist"
            : "cohort-application",
        campaign: beehiivTag,
      },
    }).catch((err) =>
      console.error("[Cohort Apply] Beehiiv sync failed:", err),
    );

    // Fire-and-forget email notification to admin via Resend
    notifyCohortApplication({
      name,
      email: normalisedEmail,
      goal,
      hours,
      ftp: ftp || null,
      frustration: frustrationStored,
      persona,
      isInnerCircle,
    }).catch((err) => console.error("[Cohort Apply] Admin notification failed:", err));

    // Fire-and-forget confirmation email to the applicant
    sendApplicantConfirmation({
      name,
      email: normalisedEmail,
      isInnerCircle,
    }).catch((err) => console.error("[Cohort Apply] Applicant confirmation failed:", err));

    return NextResponse.json({
      success: true,
      persona,
      phase: isInnerCircle ? "inner-circle" : cohortState.phase,
      cohort: isInnerCircle ? "inner-circle" : cohortState.targetCohort,
    });
  } catch (error) {
    console.error("[Cohort Apply] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
