import { auth } from "@/lib/auth";
import { isAnthony } from "@/lib/auth-utils";
import { getSlots, getSponsors } from "@/lib/inventory";
import { ThisWeekClient } from "@/components/admin/inventory/ThisWeekClient";

export default async function ThisWeekPage() {
  const session = await auth();
  const anthony = isAnthony(session);

  // Fetch next 14 days of slots (client filters down to 7 if toggled)
  const now = new Date();
  const twoWeeksOut = new Date(now);
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);

  const [slots, sponsors] = await Promise.all([
    getSlots({
      dateRange: {
        from: now.toISOString().split("T")[0],
        to: twoWeeksOut.toISOString().split("T")[0],
      },
    }),
    getSponsors(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          THIS WEEK
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Production schedule $— episodes publishing soon
        </p>
      </div>
      <ThisWeekClient
        allSlots={slots}
        sponsors={sponsors}
        isAnthony={anthony}
      />
    </div>
  );
}
