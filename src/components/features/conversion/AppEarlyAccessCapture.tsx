"use client";

import { useSearchParams } from "next/navigation";
import {
  buildGoodLegsReferralUrl,
  type AppWaitlistPlacement,
} from "@/lib/app-acquisition";
import Link from "next/link";

function Capture({ source }: { source: string }) {
  return (
    <div className="rounded-xl border border-coral/20 bg-charcoal/80 p-6 text-left">
      <p className="font-heading text-xl text-off-white">GOOD LEGS BY ROADMAN</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
        Join the iPhone beta waitlist for invitations and product updates on the Good Legs website.
        A waitlist place does not guarantee a beta invitation.
      </p>
      <a href={source} data-track="good_legs_waitlist_referral" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-coral px-6 py-3 font-heading text-off-white">
        EXPLORE GOOD LEGS &amp; JOIN THE WAITLIST
      </a>
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
        Not Done Yet members will receive access at launch as part of their membership.
        {" "}<Link href="/community/not-done-yet" className="underline">See the five-pillar coaching offer</Link>.
      </p>
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
