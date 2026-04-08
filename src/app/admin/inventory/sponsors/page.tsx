import { getSponsors, getSlots } from "@/lib/inventory";
import { SponsorsClient } from "@/components/admin/inventory/SponsorsClient";
import type { Slot } from "@/lib/inventory";

export default async function SponsorsPage() {
  const [sponsors, allSlots] = await Promise.all([
    getSponsors(),
    getSlots(),
  ]);

  // Build a lookup of sponsor id -> their slots
  const slotsMap: Record<string, Slot[]> = {};
  for (const slot of allSlots) {
    if (slot.sponsorId) {
      if (!slotsMap[slot.sponsorId]) slotsMap[slot.sponsorId] = [];
      slotsMap[slot.sponsorId].push(slot);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          SPONSOR HEALTH
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Active sponsors, delivery tracking, and renewal alerts
        </p>
      </div>
      <SponsorsClient sponsors={sponsors} slotsMap={slotsMap} />
    </div>
  );
}
