import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { getRecentAffiliateConversions } from "@/lib/recommends/queries";
import { ConversionImportForm } from "../_components/ConversionImportForm";

export const dynamic = "force-dynamic";

function money(value: string | null, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(Number(value ?? 0));
}

export default async function RecommendationConversionsPage() {
  await requireAuth();
  const conversions = await getRecentAffiliateConversions(200);
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/recommends" className="text-xs text-foreground-muted">← Recommends</Link>
        <h1 className="mt-2 text-3xl font-semibold text-white">Conversions</h1>
        <p className="mt-1 text-sm text-foreground-muted">Reported affiliate transactions. Imports are idempotent by network and transaction ID.</p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Import a network report</h2>
          <p className="mb-4 mt-1 text-xs leading-relaxed text-foreground-muted">
            Upload the CSV supplied by an affiliate network. Re-importing the
            same report updates status and commission instead of double counting.
          </p>
          <ConversionImportForm />
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
          {conversions.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-xs text-foreground-subtle">
                  <tr><th className="px-4 py-3">Transaction</th><th>Product</th><th>Sale</th><th>Commission</th><th className="px-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {conversions.map(({ conversion, productName }) => (
                    <tr key={conversion.id} className="text-foreground-muted">
                      <td className="px-4 py-3">
                        <strong className="block text-white">{conversion.network}</strong>
                        <span className="font-mono text-xs">{conversion.externalTransactionId}</span>
                        <span className="block text-xs">{conversion.transactionAt.toLocaleString("en-IE")}</span>
                      </td>
                      <td>{productName ?? "Unmatched"}</td>
                      <td className="font-mono">{money(conversion.saleAmount, conversion.currency)}</td>
                      <td className="font-mono text-white">{money(conversion.commissionAmount, conversion.currency)}</td>
                      <td className="px-4"><span className="rounded-full border border-white/10 px-2 py-1 text-xs">{conversion.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-foreground-muted">No network conversions imported yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
