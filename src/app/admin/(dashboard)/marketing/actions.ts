"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { marketingSpend } from "@/lib/db/schema";
import {
  SPEND_CHANNELS,
  type MarketingChannel,
} from "@/lib/marketing/attribution";

export interface MarketingSpendActionState {
  error?: string;
  success?: string;
}

function formString(formData: FormData, name: string, maxLength: number) {
  const value = formData.get(name);
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function createMarketingSpendAction(
  _state: MarketingSpendActionState,
  formData: FormData,
): Promise<MarketingSpendActionState> {
  await requireAuth();

  const spendDate = formString(formData, "spendDate", 10);
  const channel = formString(formData, "channel", 50) as MarketingChannel;
  const campaign = formString(formData, "campaign", 200);
  const notes = formString(formData, "notes", 500);
  const amount = Number(formString(formData, "amount", 20));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(spendDate)) {
    return { error: "Choose a valid spend date." };
  }
  if (!SPEND_CHANNELS.includes(channel)) {
    return { error: "Choose a recognised marketing channel." };
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
    return { error: "Enter a spend amount greater than zero." };
  }

  await db.insert(marketingSpend).values({
    spendDate,
    channel,
    campaign: campaign || null,
    amountCents: Math.round(amount * 100),
    currency: "EUR",
    notes: notes || null,
    source: "manual",
  });

  revalidatePath("/admin/marketing");
  return { success: "Spend added to the marketing report." };
}

export async function deleteMarketingSpendAction(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await db.delete(marketingSpend).where(eq(marketingSpend.id, id));
  revalidatePath("/admin/marketing");
}
