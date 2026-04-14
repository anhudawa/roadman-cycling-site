import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
import { notifyCohortApplication } from "@/lib/notifications";
import { upsertContact, addActivity } from "@/lib/crm/contacts";

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

    await db.insert(cohortApplications).values({
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      goal: goal.slice(0, 500),
      hours: hours.slice(0, 50),
      ftp: ftp ? ftp.slice(0, 50) : null,
      frustration: frustration.slice(0, 500),
      cohort: "2026",
      persona,
    });

    // CRM: upsert contact + activity (non-fatal)
    try {
      const contact = await upsertContact({
        email,
        name,
        source: "cohort_application",
        customFields: {
          goal,
          hours,
          ftp: ftp || null,
          frustration,
          cohort: "2026",
          persona,
        },
      });
      await addActivity(contact.id, {
        type: "cohort_application",
        title: `Applied to ${persona} cohort`,
        body: `Goal: ${goal}\n\nHours/week: ${hours}\n\nFTP: ${ftp || "n/a"}\n\nFrustration: ${frustration}`,
        meta: { goal, hours, ftp: ftp || null, frustration, persona, cohort: "2026" },
        authorName: "system",
      });
    } catch (crmErr) {
      console.error("[Cohort Apply] CRM sync failed:", crmErr);
    }

    // Fire-and-forget email notification
    notifyCohortApplication({
      name, email, goal, hours,
      ftp: ftp || null,
      frustration, persona,
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
