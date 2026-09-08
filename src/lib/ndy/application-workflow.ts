import { randomBytes } from "node:crypto";
import { and, desc, eq, gt, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cohortApplications, contactActivities, contacts, ndyApplicationFollowups as followups } from "@/lib/db/schema";
import { upsertContact, addActivity } from "@/lib/crm/contacts";
import { notifyCohortApplication } from "@/lib/notifications";
import { escapeHtml } from "@/lib/validation";
import { enrollNdyApplicant } from "./application-beehiiv";
import { applicationNextUrl, assessApplication, NDY_APPLICATION_OFFER } from "./application-offer";

type ApplicationInput = {
  name: string; email: string; goal: string; hours: string; ftp: string | null;
  frustration: string; cohort: string; persona: string; submissionKey: string;
  attribution?: Record<string, string>;
};
const tokenLifetimeMs = 30 * 86400_000;
const staleClaim = () => new Date(Date.now() - 5 * 60_000);

export async function submitNdyApplication(input: ApplicationInput) {
  // The application and its email job commit together. If either fails, the
  // request can safely be retried with the same submission key.
  const saved = await db.transaction(async (tx) => {
    const inserted = await tx.insert(cohortApplications).values(input)
      .onConflictDoNothing({ target: [cohortApplications.email, cohortApplications.cohort] })
      .returning();
    let application = inserted[0];
    let reapplication = false;
    let duplicate = false;
    if (!application) {
      // Lock the application so concurrent retries/reapplications cannot enqueue
      // two different jobs for the same current submission.
      const [existing] = await tx.select().from(cohortApplications)
        .where(and(eq(cohortApplications.email, input.email), eq(cohortApplications.cohort, "ndy")))
        .for("update");
      if (!existing) throw new Error("Application could not be saved");
      duplicate = existing.submissionKey === input.submissionKey;
      if (duplicate) application = existing;
      else {
        reapplication = true;
        [application] = await tx.update(cohortApplications).set({
          ...input,
          // Reapplying must never erase a previously confirmed purchase.
          status: existing.signedUpAt ? existing.status : "awaiting_response",
          readAt: null,
        }).where(eq(cohortApplications.id, existing.id)).returning();
      }
    }
    const [insertedJob] = await tx.insert(followups).values({
      applicationId: application.id, submissionKey: input.submissionKey,
      accessToken: randomBytes(32).toString("hex"), fit: assessApplication(input).outcome,
      ...(application.signedUpAt ? { emailStatus: "suppressed", emailError: "Already recorded as signed up" } : {}),
    }).onConflictDoNothing({ target: [followups.applicationId, followups.submissionKey] }).returning();
    const job = insertedJob ?? (await tx.select().from(followups).where(and(
      eq(followups.applicationId, application.id), eq(followups.submissionKey, input.submissionKey),
    )))[0];
    return { application, job, reapplication, duplicate };
  });

  const emailDelivery = deliverApplicationEmail(saved.job.id).catch(() => console.error("[NDY] Email job remains in outbox"));
  if (!saved.duplicate) {
    try {
      const contact = await upsertContact({ email: input.email, name: input.name, source: "cohort_application",
        customFields: { goal: input.goal, hours: input.hours, cohort: "ndy", persona: input.persona, attribution: input.attribution ?? null },
      });
      await addActivity(contact.id, {
        type: "cohort_application", title: `${saved.reapplication ? "Reapplied" : "Applied"} to Not Done Yet`,
        body: `Goal: ${input.goal}\nHours/week: ${input.hours}\n${input.frustration}`,
        meta: { applicationId: saved.application.id, fit: saved.job.fit }, authorName: "system",
      });
    } catch { console.error("[NDY] Application saved; CRM mirror requires attention"); }
    const notification = await notifyCohortApplication(input).catch(() => ({ success: false }));
    if (!notification.success) console.error("[NDY] Application saved; admin notification failed");
  }
  await emailDelivery;
  return {
    success: true, duplicate: saved.duplicate, reapplication: saved.reapplication,
    persona: input.persona, phase: "open", cohort: "ndy",
    nextUrl: applicationNextUrl(saved.job.accessToken),
  };
}

export async function deliverApplicationEmail(id: string) {
  const [job] = await db.update(followups).set({
    emailStatus: "processing", emailAttempts: sql`${followups.emailAttempts} + 1`, emailAttemptedAt: new Date(),
  }).where(and(eq(followups.id, id), lt(followups.emailAttempts, 5), or(
    inArray(followups.emailStatus, ["pending", "failed"]),
    and(eq(followups.emailStatus, "processing"), lt(followups.emailAttemptedAt, staleClaim())),
  ))).returning();
  if (!job) return;
  const [application] = await db.select().from(cohortApplications).where(eq(cohortApplications.id, job.applicationId));
  if (!application || application.submissionKey !== job.submissionKey || application.signedUpAt) {
    await db.update(followups).set({ emailStatus: "suppressed", emailError: "Superseded application or recorded signup" }).where(eq(followups.id, id));
    return;
  }
  const result = await enrollNdyApplicant({ ...application, accessToken: job.accessToken }, async (subscriberId) => {
    await db.update(followups).set({ emailStatus: "enrolling", subscriberId }).where(eq(followups.id, id));
  });
  await db.update(followups).set({
    emailStatus: result.status, emailError: result.error ?? null,
    subscriberId: result.subscriberId, journeyId: result.journeyId,
    ...(result.status === "enrolled" ? { enrolledAt: new Date() } : {}),
  }).where(eq(followups.id, id));
}

export async function recordApplicantAction(token: string, action: "join" | "questions", question?: string) {
  return db.transaction(async (tx) => {
    const [candidate] = await tx.select().from(followups).where(and(
      eq(followups.accessToken, token), gt(followups.createdAt, new Date(Date.now() - tokenLifetimeMs)),
    ));
    if (!candidate) return null;
    // Lock application before job, matching the submission transaction's order.
    const [application] = await tx.select().from(cohortApplications)
      .where(eq(cohortApplications.id, candidate.applicationId)).for("update");
    if (!application || application.submissionKey !== candidate.submissionKey) return null;
    const [job] = await tx.select().from(followups).where(eq(followups.id, candidate.id)).for("update");
    if (!job) return null;
    if (action === "join") {
      if (!job.checkoutStartedAt) await tx.update(followups).set({ checkoutStartedAt: new Date() }).where(eq(followups.id, job.id));
      // Checkout intent is not proof of payment. Only confirmed purchases may
      // set signed_up/signedUpAt through the existing authenticated workflow.
      return { id: job.id, duplicate: Boolean(job.checkoutStartedAt), checkoutUrl: NDY_APPLICATION_OFFER.checkoutUrl };
    }
    if (job.questionReceivedAt) return { id: job.id, duplicate: true };
    await tx.update(followups).set({ question: question ?? "I'd like to ask a question before joining.",
      questionReceivedAt: new Date(), sarahStatus: "pending",
    }).where(eq(followups.id, job.id));
    await tx.update(cohortApplications).set({
      status: application.signedUpAt ? application.status : "questions_requested", readAt: null,
    }).where(eq(cohortApplications.id, application.id));
    const [contact] = await tx.select({ id: contacts.id }).from(contacts).where(eq(contacts.email, application.email));
    if (contact) {
      await tx.update(contacts).set({ owner: "sarah" }).where(eq(contacts.id, contact.id));
      await tx.insert(contactActivities).values({ contactId: contact.id, type: "note",
        title: "Not Done Yet — questions for Sarah", body: question ?? "Please contact me before I join.",
        meta: { applicationId: application.id, followupId: job.id }, authorName: "system",
      });
    }
    return { id: job.id, duplicate: false };
  });
}

export async function deliverSarahNotification(id: string) {
  const [job] = await db.update(followups).set({ sarahStatus: "sending",
    sarahAttempts: sql`${followups.sarahAttempts} + 1`, sarahAttemptedAt: new Date(),
  }).where(and(eq(followups.id, id), lt(followups.sarahAttempts, 5),
    // Resend deduplicates for 24 hours; stop automatic retries before that
    // window expires instead of risking a second email on an ambiguous send.
    gt(followups.questionReceivedAt, new Date(Date.now() - 23 * 3600_000)), or(
      inArray(followups.sarahStatus, ["pending", "failed"]),
      and(eq(followups.sarahStatus, "sending"), lt(followups.sarahAttemptedAt, staleClaim())),
    ),
  )).returning();
  if (!job) return;
  const [app] = await db.select().from(cohortApplications).where(eq(cohortApplications.id, job.applicationId));
  if (!app) return;
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Admin notification email service is not configured");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `ndy-question-${job.id}` },
      body: JSON.stringify({ from: "Roadman Cycling <noreply@roadmancycling.com>",
        to: [NDY_APPLICATION_OFFER.adminNotificationEmail], reply_to: app.email,
        subject: "Not Done Yet — an applicant has a question",
        html: `<h1>Not Done Yet question</h1><p>Application #${job.applicationId}</p><p>${escapeHtml(job.question ?? "Please contact me before I join.").replace(/\n/g, "<br>")}</p><p><a href="https://www.roadmancycling.com/admin/applications/followups">Open the application and contact details</a></p><p>Reply to this email to answer the applicant.</p>`,
      }),
    });
    if (!response.ok) throw new Error(`Admin notification failed (${response.status})`);
    await db.update(followups).set({ sarahStatus: "sent", sarahError: null, sarahNotifiedAt: new Date() }).where(eq(followups.id, id));
  } catch (err) {
    await db.update(followups).set({ sarahStatus: "failed", sarahError: err instanceof Error ? err.message : "Admin notification failed" }).where(eq(followups.id, id));
  }
}

export async function retryNdyOutbox() {
  await db.update(followups).set({ sarahStatus: "held", sarahError: "Automatic retry window ended; reply to the applicant directly" })
    .where(and(inArray(followups.sarahStatus, ["pending", "failed", "sending"]), lt(followups.questionReceivedAt, new Date(Date.now() - 23 * 3600_000))));
  // A terminated request after the enrollment marker cannot be retried safely.
  await db.update(followups).set({ emailStatus: "uncertain", emailError: "Enrollment interrupted; check Beehiiv before resending" })
    .where(and(eq(followups.emailStatus, "enrolling"), lt(followups.emailAttemptedAt, staleClaim())));
  const emailJobs = await db.select({ id: followups.id }).from(followups).where(and(
    inArray(followups.emailStatus, ["pending", "failed", "processing"]), lt(followups.emailAttempts, 5),
    or(isNull(followups.emailAttemptedAt), lt(followups.emailAttemptedAt, staleClaim())),
  )).orderBy(followups.createdAt).limit(10);
  const sarahJobs = await db.select({ id: followups.id }).from(followups).where(and(
    inArray(followups.sarahStatus, ["pending", "failed", "sending"]), lt(followups.sarahAttempts, 5),
    gt(followups.questionReceivedAt, new Date(Date.now() - 23 * 3600_000)),
    or(isNull(followups.sarahAttemptedAt), lt(followups.sarahAttemptedAt, staleClaim())),
  )).orderBy(followups.questionReceivedAt).limit(10);
  // Bound each cron invocation: two workers, and independent email/Sarah work.
  const jobs = [...emailJobs.map(({ id }) => () => deliverApplicationEmail(id)), ...sarahJobs.map(({ id }) => () => deliverSarahNotification(id))];
  for (let i = 0; i < jobs.length; i += 2) await Promise.allSettled(jobs.slice(i, i + 2).map((work) => work()));
  return { emailJobs: emailJobs.length, sarahJobs: sarahJobs.length };
}

export async function listNdyFollowups() {
  return db.select({
    id: followups.id, applicationId: followups.applicationId, name: cohortApplications.name, email: cohortApplications.email,
    fit: followups.fit, emailStatus: followups.emailStatus, emailError: followups.emailError,
    emailAttempts: followups.emailAttempts, enrolledAt: followups.enrolledAt,
    question: followups.question, questionReceivedAt: followups.questionReceivedAt,
    sarahStatus: followups.sarahStatus, sarahError: followups.sarahError, sarahNotifiedAt: followups.sarahNotifiedAt,
    checkoutStartedAt: followups.checkoutStartedAt, createdAt: followups.createdAt,
  }).from(followups).innerJoin(cohortApplications, eq(followups.applicationId, cohortApplications.id))
    .orderBy(desc(followups.createdAt)).limit(100);
}
