"use server";

import { auth } from "@/lib/auth";
import { isAnthony } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import {
  updateSlot,
  createSlot,
  updateSponsor,
  createSponsor,
  getSlotById,
  type InventoryType,
  type InventoryStatus,
  type ReadStatus,
} from "@/lib/inventory";

// ---------------------------------------------------------------------------
// Slot mutations
// ---------------------------------------------------------------------------

export async function updateSlotScriptAction(slotId: string, scriptText: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await updateSlot(slotId, { scriptText });
  revalidatePath("/admin/inventory");
}

export async function advanceReadStatusAction(slotId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const slot = await getSlotById(slotId);
  if (!slot) throw new Error("Slot not found");

  const statusFlow: ReadStatus[] = [
    "pending",
    "script_written",
    "read_recorded",
    "approved",
    "live",
  ];

  const currentIndex = statusFlow.indexOf(slot.readStatus ?? "pending");
  if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) {
    throw new Error("Cannot advance read status further");
  }

  const nextStatus = statusFlow[currentIndex + 1];

  // Only Anthony can advance to approved or live
  if ((nextStatus === "approved" || nextStatus === "live") && !isAnthony(session)) {
    throw new Error("Only Anthony can approve or mark as live");
  }

  await updateSlot(slotId, { readStatus: nextStatus });
  revalidatePath("/admin/inventory");
}

export async function bookSlotAction(
  slotId: string,
  data: {
    sponsorId: string;
    ratePaid: number;
    campaignId: string;
  },
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await updateSlot(slotId, {
    status: "sold" as InventoryStatus,
    sponsorId: data.sponsorId,
    ratePaid: data.ratePaid,
    campaignId: data.campaignId,
  });
  revalidatePath("/admin/inventory");
}

export async function holdSlotAction(slotId: string, sponsorId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await updateSlot(slotId, {
    status: "held" as InventoryStatus,
    sponsorId,
  });
  revalidatePath("/admin/inventory");
}

export async function convertHeldToSoldAction(
  slotId: string,
  ratePaid: number,
  campaignId: string,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await updateSlot(slotId, {
    status: "sold" as InventoryStatus,
    ratePaid,
    campaignId,
  });
  revalidatePath("/admin/inventory");
}

export async function releaseSlotAction(slotId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await updateSlot(slotId, {
    status: "available" as InventoryStatus,
    sponsorId: null,
    ratePaid: null,
    campaignId: null,
  });
  revalidatePath("/admin/inventory");
}

export async function updateSlotNotesAction(slotId: string, notes: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await updateSlot(slotId, { notes });
  revalidatePath("/admin/inventory");
}

// ---------------------------------------------------------------------------
// Sponsor mutations
// ---------------------------------------------------------------------------

export async function updateSponsorFieldAction(
  sponsorId: string,
  field: string,
  value: string | number | null,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await updateSponsor(sponsorId, { [field]: value });
  revalidatePath("/admin/inventory");
}

export async function createSponsorAction(data: {
  brandName: string;
  contactName: string | null;
  contactEmail: string;
  tier: string | null;
  totalValue: number | null;
  notes: string | null;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const sponsor = await createSponsor({
    brandName: data.brandName,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    tier: data.tier as any,
    contractStart: null,
    contractEnd: null,
    totalValue: data.totalValue,
    renewalDate: null,
    lastContact: new Date().toISOString().split("T")[0],
    notes: data.notes,
    logoUrl: null,
  });

  revalidatePath("/admin/inventory");
  return sponsor;
}

// ---------------------------------------------------------------------------
// Episode creation (bulk slot creation)
// ---------------------------------------------------------------------------

export async function createEpisodeAction(data: {
  episodeNumber: number;
  episodeTitle: string;
  plannedPublishDate: string;
  channel: "podcast" | "newsletter" | "youtube";
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const slotConfigs: { inventoryType: InventoryType; position: number }[] = [];

  if (data.channel === "podcast") {
    slotConfigs.push(
      { inventoryType: "podcast_preroll", position: 1 },
      { inventoryType: "podcast_midroll", position: 2 },
      { inventoryType: "podcast_endroll", position: 3 },
    );
  } else if (data.channel === "newsletter") {
    slotConfigs.push(
      { inventoryType: "newsletter_dedicated", position: 1 },
      { inventoryType: "newsletter_banner", position: 2 },
      { inventoryType: "newsletter_classified", position: 3 },
      { inventoryType: "newsletter_classified", position: 4 },
    );
  } else if (data.channel === "youtube") {
    slotConfigs.push({ inventoryType: "youtube_integration", position: 1 });
  }

  const createdSlots = [];
  for (const config of slotConfigs) {
    const slot = await createSlot({
      inventoryType: config.inventoryType,
      episodeNumber: data.channel === "podcast" ? data.episodeNumber : null,
      episodeTitle: data.channel === "podcast" ? data.episodeTitle : null,
      plannedPublishDate: data.plannedPublishDate,
      position: config.position,
      status: "available",
      sponsorId: null,
      ratePaid: null,
      campaignId: null,
      briefUrl: null,
      scriptText: null,
      readStatus: data.channel === "podcast" ? "pending" : null,
      eventId: null,
      notes: null,
    });
    createdSlots.push(slot);
  }

  revalidatePath("/admin/inventory");
  return createdSlots;
}
