import { addActivity, upsertContact } from "@/lib/crm/contacts";
import { upsertByEmail as upsertRiderProfile } from "@/lib/rider-profile/store";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";
import { refreshLeadScore } from "@/lib/paid-reports/lead-score";
import { emailToolResult } from "./email";
import { markEmailSent, saveToolResult } from "./store";
import type { SaveToolResultInput, ToolResult } from "./types";

/**
 * Single entry point every tool completion routes through.
 *
 *   1. Upsert the rider profile (progressive — only the fields the
 *      caller supplies are patched, `undefined` preserves existing values).
 *   2. Save the tool_result row linked to the profile.
 *   3. Fire CRM tag + activity so the contact shows up in sales.
 *   4. Fan-out to Beehiiv + transactional email (non-fatal each).
 *
 * Returns the saved ToolResult so the caller can redirect the user
 * straight to /results/<tool>/<slug>.
 */

export interface CompleteToolResultInput extends Omit<SaveToolResultInput, "riderProfileId"> {
  /** Fields to merge into the rider profile (all optional). */
  profilePatch?: {
    firstName?: string | null;
    ageRange?: string | null;
    discipline?: string | null;
    weeklyTrainingHours?: number | null;
    currentFtp?: number | null;
    currentWeight?: number | null;
    weightUnit?: "kg" | "lb" | null;
    trainingTool?:
      | "zwift"
      | "trainerroad"
      | "outside"
      | "garmin"
      | "wahoo"
      | "other"
      | null;
    targetEvent?: string | null;
    coachingStatus?: "self_coached" | "coached" | "unsure" | null;
    coachingInterestLevel?: number | null;
    mainGoal?: string | null;
    biggestLimiter?: string | null;
    coachingInterest?: string | null;
    selfCoachedOrCoached?: string | null;
    consentSaveProfile?: boolean;
    consentEmailFollowup?: boolean;
    marketingConsent?: boolean;
    dataStorageConsent?: boolean;
    researchConsent?: boolean;
  };
  /** Base URL for the result permalink in the email — request origin. */
  baseUrl: string;
  /** When false, skip the transactional result email (plateau has its own). */
  sendEmail?: boolean;
  /** Beehiiv sync is enabled by default, disable for tests. */
  syncBeehiiv?: boolean;
}

export interface CompleteToolResultOutcome {
  result: ToolResult;
  profileId: number;
  emailSent: boolean;
  emailError?: string;
}

export async function completeToolResult(
  input: CompleteToolResultInput,
): Promise<CompleteToolResultOutcome> {
  const email = input.email.trim().toLowerCase();
  const patch = input.profilePatch ?? {};

  // 1 — rider profile (also materialises a contacts row as FK target)
  const profile = await upsertRiderProfile({
    email,
    firstName: patch.firstName,
    ageRange: patch.ageRange,
    discipline: patch.discipline,
    weeklyTrainingHours: patch.weeklyTrainingHours,
    currentFtp: patch.currentFtp,
    currentWeight: patch.currentWeight,
    weightUnit: patch.weightUnit,
    trainingTool: patch.trainingTool,
    targetEvent: patch.targetEvent,
    coachingStatus: patch.coachingStatus,
    coachingInterestLevel: patch.coachingInterestLevel,
    mainGoal: patch.mainGoal,
    biggestLimiter: patch.biggestLimiter,
    coachingInterest: patch.coachingInterest,
    selfCoachedOrCoached: patch.selfCoachedOrCoached,
    consentSaveProfile: patch.consentSaveProfile,
    consentEmailFollowup: patch.consentEmailFollowup,
    marketingConsent: patch.marketingConsent,
    dataStorageConsent: patch.dataStorageConsent,
    researchConsent: patch.researchConsent,
  });

  // 2 — tool_result row
  const result = await saveToolResult({
    ...input,
    email,
    riderProfileId: profile.id,
  });

  // 3 — CRM tag + activity. Errors are swallowed so the user always
  //     sees their result even if sales integrations hiccup.
  void (async () => {
    try {
      const contact = await upsertContact({
        email,
        name: patch.firstName ?? null,
        source: "subscribers",
        customFields: {
          last_tool: input.toolSlug,
          last_tool_result: result.slug,
          ...(result.primaryResult
            ? { [`last_${input.toolSlug}_result`]: result.primaryResult }
            : {}),
        },
      });
      await addActivity(contact.id, {
        type: "tag_added",
        title: `Completed ${input.toolSlug} tool`,
        body: result.summary,
        meta: {
          tool: input.toolSlug,
          slug: result.slug,
          primaryResult: result.primaryResult,
          tags: input.tags,
        },
        authorName: "system",
      });
    } catch (err) {
      console.error("[tool-results/pipeline] CRM sync failed:", err);
    }
  })();

  // 4a — Beehiiv (non-fatal)
  if (input.syncBeehiiv !== false) {
    void subscribeToBeehiiv({
      email,
      name: patch.firstName ?? undefined,
      tags: input.tags,
      customFields: {
        last_tool: input.toolSlug,
        last_tool_result: result.slug,
      },
      utm: {
        source: input.utm?.source ?? "site",
        medium: input.utm?.medium ?? "tool",
        campaign: input.utm?.campaign ?? input.toolSlug,
      },
    }).catch((err) =>
      console.error("[tool-results/pipeline] Beehiiv sync failed:", err),
    );
  }

  // 4c — lead score refresh (non-fatal — admin-only signal)
  void refreshLeadScore(profile.id).catch((err) =>
    console.error("[tool-results/pipeline] refreshLeadScore failed:", err),
  );

  // 4b — transactional email
  let emailSent = false;
  let emailError: string | undefined;
  if (input.sendEmail !== false) {
    const outcome = await emailToolResult({
      result,
      firstName: patch.firstName ?? null,
      baseUrl: input.baseUrl,
    });
    emailSent = outcome.sent;
    emailError = outcome.error;
    if (emailSent) {
      await markEmailSent(result.slug).catch((err) =>
        console.error("[tool-results/pipeline] markEmailSent failed:", err),
      );
    }
  }

  return { result, profileId: profile.id, emailSent, emailError };
}
