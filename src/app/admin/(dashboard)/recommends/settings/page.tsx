import Link from "next/link";
import { Button } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import {
  FALLBACK_RECOMMENDATION_SETTINGS,
  getAdminRecommendationSettings,
} from "@/lib/recommends/queries";
import { updateRecommendationSettingsAction } from "../actions";

export const dynamic = "force-dynamic";

const field =
  "focus-ring w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-border-focus)]";

export default async function RecommendationSettingsPage() {
  await requireAdmin();
  const settings = await getAdminRecommendationSettings();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/recommends" className="text-xs text-foreground-muted">
          ← Recommends
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Sensitive commercial and disclosure defaults are administrator-only.
        </p>
      </header>

      <form
        action={updateRecommendationSettingsAction}
        className="space-y-5 rounded-lg border border-white/10 bg-white/[0.035] p-5"
      >
        <label className="block">
          <span className="mb-1 block text-xs text-foreground-muted">
            Public affiliate disclosure
          </span>
          <textarea
            className={field}
            name="affiliateDisclosure"
            rows={4}
            required
            defaultValue={
              settings.get("affiliate_disclosure") ??
              FALLBACK_RECOMMENDATION_SETTINGS.affiliateDisclosure
            }
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs text-foreground-muted">
              Default shopping region
            </span>
            <select
              className={field}
              name="defaultRegion"
              defaultValue={
                settings.get("default_region") ??
                FALLBACK_RECOMMENDATION_SETTINGS.defaultRegion
              }
            >
              <option value="IE">Ireland</option>
              <option value="GB">United Kingdom</option>
              <option value="EU">Europe</option>
              <option value="US">United States</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs text-foreground-muted">
              Stale-offer warning after
            </span>
            <div className="flex items-center gap-2">
              <input
                className={field}
                name="staleOfferDays"
                type="number"
                min="1"
                max="365"
                defaultValue={
                  settings.get("stale_offer_days") ??
                  FALLBACK_RECOMMENDATION_SETTINGS.staleOfferDays
                }
              />
              <span className="text-sm text-foreground-muted">days</span>
            </div>
          </label>
        </div>
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
