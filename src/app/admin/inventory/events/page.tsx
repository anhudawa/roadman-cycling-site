import { getEvents, getSlots, getUtilisation } from "@/lib/inventory";
import { EventsClient } from "@/components/admin/inventory/EventsClient";

export default async function EventsPage() {
  const now = new Date();
  const sixMonthsOut = new Date(now);
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);

  const dateRange = {
    from: now.toISOString().split("T")[0],
    to: sixMonthsOut.toISOString().split("T")[0],
  };

  const [events, allSlots, utilisation] = await Promise.all([
    getEvents({ dateRange }),
    getSlots({ dateRange }),
    getUtilisation(dateRange),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          EVENTS OVERLAY
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Event windows mapped against inventory pipeline
        </p>
      </div>
      <EventsClient
        events={events}
        allSlots={allSlots}
        utilisation={utilisation}
      />
    </div>
  );
}
