"use client";

import { useActionState } from "react";
import { Button } from "@/components/admin/ui";
import { importAffiliateConversionsAction } from "../actions";

export function ConversionImportForm() {
  const [state, action, pending] = useActionState(
    importAffiliateConversionsAction,
    {},
  );
  return (
    <form action={action} className="space-y-3">
      <input
        type="file"
        name="file"
        accept=".csv,text/csv"
        required
        className="block w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm text-foreground-muted"
      />
      <p className="text-xs leading-relaxed text-foreground-subtle">
        Required columns: network, transaction_id and transaction_at. Optional:
        retailer, product_slug, offer_id, click_id, sale_amount,
        commission_amount, currency and status.
      </p>
      {state.error ? <p role="alert" className="text-sm text-red-300">{state.error}</p> : null}
      {state.success ? <p role="status" className="text-sm text-emerald-300">{state.success}</p> : null}
      <Button
        type="submit"
        disabled={pending}
      >
        {pending ? "Importing…" : "Import conversions"}
      </Button>
    </form>
  );
}
