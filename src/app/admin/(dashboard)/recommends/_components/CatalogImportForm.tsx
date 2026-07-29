"use client";

import { useActionState } from "react";
import {
  importRecommendationCatalogAction,
  type RecommendsActionState,
} from "../actions";

const initialState: RecommendsActionState = {};

export function CatalogImportForm() {
  const [state, action, pending] = useActionState(
    importRecommendationCatalogAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="space-y-4 rounded-lg border border-white/10 bg-white/[0.035] p-5"
    >
      <div>
        <h2 className="font-semibold text-white">Import products and offers</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Rows are upserted by product slug. Repeat a product slug to attach
          more than one retailer offer.
        </p>
      </div>
      <input
        name="file"
        type="file"
        accept=".csv,text/csv"
        required
        className="block w-full rounded-md border border-white/15 bg-black/20 p-3 text-sm text-white"
      />
      {state.error ? (
        <p role="alert" className="text-sm text-red-300">{state.error}</p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-emerald-300">{state.success}</p>
      ) : null}
      <button
        disabled={pending}
        className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Importing…" : "Import catalogue"}
      </button>
    </form>
  );
}
