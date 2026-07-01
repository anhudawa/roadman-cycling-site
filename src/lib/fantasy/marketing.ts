/**
 * Roadman Fantasy Tour — lead-gen plumbing (Section 5.1).
 *
 * The email gate is the business case: every verified player must land
 * in Beehiiv tagged `fantasy-tour-2026` within 5 minutes, and a Meta
 * CAPI Lead event fires so the game can front a paid funnel. Both calls
 * are fire-and-forget from the user's perspective but tracked on the
 * player row so the cron retry queue can sweep up silent failures —
 * "if the sync fails silently, the project has failed" (Section 0.3).
 */

import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyPlayers } from "@/lib/db/schema";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";

const FANTASY_TAGS = ["fantasy-tour-2026", "source:fantasy"];

export async function syncPlayerToBeehiiv(player: {
  id: number;
  email: string;
  firstName: string;
  country: string | null;
  riderPersona: string | null;
}): Promise<void> {
  try {
    const tags = [...FANTASY_TAGS];
    if (player.riderPersona) tags.push(`persona:${player.riderPersona}`);
    const result = await subscribeToBeehiiv({
      email: player.email,
      name: player.firstName,
      tags,
      customFields: { country: player.country },
      sendWelcomeEmail: false,
      utm: { source: "website", medium: "fantasy", campaign: "fantasy-tour-2026" },
    });
    await db
      .update(fantasyPlayers)
      .set({
        beehiivSubscriberId: result.subscriberId,
        beehiivSyncedAt: result.subscriberId ? new Date() : null,
        beehiivSyncAttempts: sql`${fantasyPlayers.beehiivSyncAttempts} + 1`,
      })
      .where(eq(fantasyPlayers.id, player.id));
  } catch (error) {
    console.error("[fantasy] beehiiv sync failed:", error);
    await db
      .update(fantasyPlayers)
      .set({ beehiivSyncAttempts: sql`${fantasyPlayers.beehiivSyncAttempts} + 1` })
      .where(eq(fantasyPlayers.id, player.id));
  }
}

/**
 * Server-side Meta Conversions API Lead event. The client pixel fires
 * the matching browser event with the same eventId for deduplication
 * (Meta dedup rules). No-op until META_CAPI_ACCESS_TOKEN and
 * META_PIXEL_ID are configured.
 */
export async function sendCapiLeadEvent(player: {
  id: number;
  email: string;
}): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID;
  if (!token || !pixelId) return;

  try {
    const hashedEmail = createHash("sha256")
      .update(player.email.trim().toLowerCase())
      .digest("hex");
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              event_id: `fantasy-signup-${player.id}`,
              action_source: "website",
              user_data: { em: [hashedEmail] },
              custom_data: { content_name: "fantasy-tour-2026" },
            },
          ],
        }),
      },
    );
    if (!response.ok) {
      console.error("[fantasy] CAPI event failed:", response.status, await response.text());
      return;
    }
    await db
      .update(fantasyPlayers)
      .set({ capiSentAt: new Date() })
      .where(eq(fantasyPlayers.id, player.id));
  } catch (error) {
    console.error("[fantasy] CAPI event failed:", error);
  }
}
