import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { CatalogImportForm } from "../_components/CatalogImportForm";

export const dynamic = "force-dynamic";

export default async function RecommendationImportsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/recommends" className="text-xs text-foreground-muted">
          ← Recommends
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Catalogue imports & exports
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Move products and regional offers in bulk without editing code.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <a
          href="/api/admin/recommends/catalog-template"
          className="rounded-lg border border-white/10 bg-white/[0.035] p-5 text-white hover:border-white/25"
        >
          <strong>Download blank CSV template</strong>
          <span className="mt-2 block text-sm text-foreground-muted">
            Start a clean bulk upload with the supported column names.
          </span>
        </a>
        <a
          href="/api/admin/recommends/export"
          className="rounded-lg border border-white/10 bg-white/[0.035] p-5 text-white hover:border-white/25"
        >
          <strong>Export current catalogue</strong>
          <span className="mt-2 block text-sm text-foreground-muted">
            Includes editorial fields and one row per retailer offer.
          </span>
        </a>
      </section>

      <CatalogImportForm />

      <p className="text-xs leading-relaxed text-foreground-subtle">
        Published rows go live immediately. Use <strong>draft</strong> while
        reviewing unverified products, images or affiliate destinations.
      </p>
    </div>
  );
}
