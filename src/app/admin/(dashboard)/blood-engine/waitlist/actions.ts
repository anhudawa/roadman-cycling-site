"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/admin/auth";
import { unsubscribeFromWaitlist } from "@/lib/blood-engine/waitlist";

export async function unsubscribeAction(email: string): Promise<void> {
  await requireAuth();
  await unsubscribeFromWaitlist(email);
  revalidatePath("/admin/blood-engine/waitlist");
}
