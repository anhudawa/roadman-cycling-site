"use client";

import { useSearchParams } from "next/navigation";
import {
  buildGoodLegsReferralUrl,
  type AppWaitlistPlacement,
} from "@/lib/app-acquisition";

function Capture({ source }: { source: string }) {
  return (
    <div className="rounded-xl border border-coral/20 bg-charcoal/80 p-6 text-left">
      <p className="font-heading text-xl text-off-white">JOIN THE IPHONE BETA WAITLIST</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
        Leave your email on the Good Legs website. We’ll be in touch with beta invitations and news from the build.
      </p>
      <a href={source} data-track="good_legs_waitlist_referral" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-coral px-6 py-3 font-heading text-off-white">
        EXPLORE GOOD LEGS →
      </a>

    </div>
  );
}

export function AppEarlyAccessCapture({
  placement,
  acquisitionSource,
}: {
  placement: AppWaitlistPlacement;
  acquisitionSource?: string;
}) {
  const searchParams = useSearchParams();
  return (
    <Capture
      source={buildGoodLegsReferralUrl(
        acquisitionSource ?? searchParams.get("source"),
        placement,
      )}
    />
  );
}

export function AppEarlyAccessCaptureFallback({
  placement,
  acquisitionSource,
}: {
  placement: AppWaitlistPlacement;
  acquisitionSource?: string;
}) {
  return <Capture source={buildGoodLegsReferralUrl(acquisitionSource, placement)} />;
}
