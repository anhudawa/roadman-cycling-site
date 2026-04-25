import {
  getUtilisation,
  getSlots,
  getSponsors,
  getEvents,
} from "@/lib/inventory";
import { PipelineClient } from "@/components/admin/inventory/PipelineClient";

export default async function PipelinePage() {
  const now = new Date();
  const sixMonthsOut = new Date(now);
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);

  const dateRange = {
    from: now.toISOString().split("T")[0],
    to: sixMonthsOut.toISOString().split("T")[0],
  };

  const [utilisation, allSlots, sponsors, events] = await Promise.all([
    getUtilisation(dateRange),
    getSlots({ dateRange }),
    getSponsors(),
    getEvents({ dateRange }),
  ]);

  // Compute top metrics
  const revenueBooked = allSlots
    .filter((s) => s.status === "sold" || s.status === "live")
    .reduce((sum, s) => sum + (s.ratePaid ?? s.rackRate), 0);

  const availableAtRack = allSlots
    .filter((s) => s.status === "available")
    .reduce((sum, s) => sum + s.rackRate, 0);

  const totalPotential = allSlots.reduce((sum, s) => sum + s.rackRate, 0);
  const gap = totalPotential - revenueBooked;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          PIPELINE
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          6-month inventory overview $€” click any cell to manage slots
        </p>
      </div>
      <PipelineClient
        utilisation={utilisation}
        metrics={{ revenueBooked, availableAtRack, gap }}
        allSlots={allSlots}
        sponsors={sponsors}
        events={events}
      />
    </div>
  );
}
