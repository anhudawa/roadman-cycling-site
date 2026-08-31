"use client";

import { useSearchParams } from "next/navigation";
import {
  buildAppWaitlistSource,
  type AppWaitlistPlacement,
} from "@/lib/app-acquisition";
import { EmailCapture } from "./EmailCapture";

function Capture({ source }: { source: string }) {
  return (
    <EmailCapture
      heading="GET EARLY ACCESS"
      subheading="Get beta, launch and product-name updates first. Joining also includes Roadman's Saturday Spin newsletter; one click unsubscribes."
      buttonText="JOIN EARLY ACCESS"
      source={source}
      className="border-coral/20 bg-charcoal/80 text-left shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
    />
  );
}

export function AppEarlyAccessCapture({
  placement,
}: {
  placement: AppWaitlistPlacement;
}) {
  const searchParams = useSearchParams();
  return (
    <Capture
      source={buildAppWaitlistSource(searchParams.get("source"), placement)}
    />
  );
}

export function AppEarlyAccessCaptureFallback({
  placement,
}: {
  placement: AppWaitlistPlacement;
}) {
  return <Capture source={buildAppWaitlistSource(null, placement)} />;
}
