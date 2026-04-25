import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
import { notifyCohortApplication } from "@/lib/notifications";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { getCohortState } from "@/lib/cohort";
import { EMAIL_REGEX } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, goal, hours, ftp, frustration } = body;

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

    // Read cohort state $€” drives which tag/cohort this submission gets.
    // During "open" + "closing-today" the submission is a real Cohort 2
    // application; during "waitlist" it's a Cohort 3 waitlist signup.
    const cohortState = getCohortState();
    const cohortLabel = `cohort-${cohortState.targetCohort}`;

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
        frustration: frustration.slice(0, 500),
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
          frustration: frustration.slice(0, 500),
          persona,
        },
      });

    // CRM: upsert contact + activity (non-fatal)
    try {
      const contact = await upsertContact({
        email: normalisedEmail,
        name,
        source: cohortState.phase === "waitlist" ? "cohort_waitlist" : "cohort_application",
        customFields: {
          goal,
          hours,
          ftp: ftp || null,
          frustration,
          cohort: cohortLabel,
          persona,
          phase: cohortState.phase,
        },
      });
      await addActivity(contact.id, {
        type: cohortState.phase === "waitlist" ? "cohort_waitlist" : "cohort_application",
        title:
          cohortState.phase === "waitlist"
            ? `Joined ${cohortLabel} waitlist (${persona})`
            : `Applied to ${cohortLabel} (${persona})`,
        body: `Goal: ${goal}\n\nHours/week: ${hours}\n\nFTP: ${ftp || "n/a"}\n\nFrustration: ${frustration}`,
        meta: {
          goal,
          hours,
          ftp: ftp || null,
          frustration,
          persona,
          cohort: cohortLabel,
          phase: cohortState.phase,
        },
        authorName: "system",
      });
    } catch (crmErr) {
      console.error("[Cohort Apply] CRM sync failed:", crmErr);
    }

    // Beehiiv: upsert subscriber + tag. Tag varies by phase:
    //   open / closing-today $†’ "cohort-2-applicant"
    //   waitlist             $†’ "cohort-3-waitlist"
    // Non-fatal $€” application still succeeds if Beehiiv is down.
    subscribeToBeehiiv({
      email: normalisedEmail,
      name,
      tags: [cohortState.submissionTag, `persona-${persona}`],
      customFields: {
        goal,
        hours,
        ftp: ftp || null,
        frustration,
        cohort: cohortLabel,
        persona,
        phase: cohortState.phase,
      },
      utm: {
        source: "site",
        medium:
          cohortState.phase === "waitlist" ? "cohort-waitlist" : "cohort-application",
        campaign: cohortState.submissionTag,
      },
    }).catch((err) =>
      console.error("[Cohort Apply] Beehiiv sync failed:", err),
    );

    // Fire-and-forget email notification via Resend
    notifyCohortApplication({
      name,
      email: normalisedEmail,
      goal,
      hours,
      ftp: ftp || null,
      frustration,
      persona,
    }).catch((err) => console.error("[Cohort Apply] Email notification failed:", err));

    return NextResponse.json({
      success: true,
      persona,
      phase: cohortState.phase,
      cohort: cohortState.targetCohort,
    });
  } catch (error) {
    console.error("[Cohort Apply] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
