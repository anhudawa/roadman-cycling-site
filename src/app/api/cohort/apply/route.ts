import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
import { notifyCohortApplication } from "@/lib/notifications";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";

/** RFC-5322 lite — rejects foo@, @bar, and other common fat-finger failures. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Current cohort tag. Single source of truth — read by the /apply route
 * and any future cohort-state UI. When Cohort 2 closes and the site
 * flips to Cohort 3 waitlist mode, this becomes "cohort-3-waitlist".
 */
const COHORT_APPLICANT_TAG = "cohort-2-applicant";
const COHORT_LABEL = "2026";

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
        cohort: COHORT_LABEL,
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
        source: "cohort_application",
        customFields: {
          goal,
          hours,
          ftp: ftp || null,
          frustration,
          cohort: COHORT_LABEL,
          persona,
        },
      });
      await addActivity(contact.id, {
        type: "cohort_application",
        title: `Applied to ${persona} cohort`,
        body: `Goal: ${goal}\n\nHours/week: ${hours}\n\nFTP: ${ftp || "n/a"}\n\nFrustration: ${frustration}`,
        meta: { goal, hours, ftp: ftp || null, frustration, persona, cohort: COHORT_LABEL },
        authorName: "system",
      });
    } catch (crmErr) {
      console.error("[Cohort Apply] CRM sync failed:", crmErr);
    }

    // Beehiiv: upsert subscriber + tag as applicant. Non-fatal — if
    // Beehiiv is down, the application still succeeds on our side.
    subscribeToBeehiiv({
      email: normalisedEmail,
      name,
      tags: [COHORT_APPLICANT_TAG, `persona-${persona}`],
      customFields: {
        goal,
        hours,
        ftp: ftp || null,
        frustration,
        cohort: COHORT_LABEL,
        persona,
      },
      utm: {
        source: "site",
        medium: "cohort-application",
        campaign: COHORT_APPLICANT_TAG,
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

    return NextResponse.json({ success: true, persona });
  } catch (error) {
    console.error("[Cohort Apply] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
