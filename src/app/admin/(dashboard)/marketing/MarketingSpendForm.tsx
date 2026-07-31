"use client";

import { useActionState } from "react";
import { Button, Input, Select } from "@/components/admin/ui";
import {
  MARKETING_CHANNEL_LABELS,
  SPEND_CHANNELS,
} from "@/lib/marketing/attribution";
import {
  createMarketingSpendAction,
  type MarketingSpendActionState,
} from "./actions";

const initialState: MarketingSpendActionState = {};

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function MarketingSpendForm() {
  const [state, action, pending] = useActionState(
    createMarketingSpendAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg-muted)]">
          Date
        </span>
        <Input name="spendDate" type="date" defaultValue={localDate()} required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg-muted)]">
          Channel
        </span>
        <Select name="channel" defaultValue="google_ads" required>
          {SPEND_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {MARKETING_CHANNEL_LABELS[channel]}
            </option>
          ))}
        </Select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg-muted)]">
          Spend (EUR)
        </span>
        <Input
          name="amount"
          type="number"
          min="0.01"
          max="1000000"
          step="0.01"
          inputMode="decimal"
          placeholder="30.00"
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg-muted)]">
          Campaign
        </span>
        <Input
          name="campaign"
          type="text"
          maxLength={200}
          placeholder="ndy_search_high_intent"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg-muted)]">
          Note
        </span>
        <Input
          name="notes"
          type="text"
          maxLength={500}
          placeholder="Optional invoice, campaign or test note"
        />
      </label>
      <div className="flex min-h-9 items-center gap-3 sm:col-span-2">
        <Button type="submit" loading={pending}>
          Add spend
        </Button>
        {state.error ? (
          <p role="alert" className="text-sm text-[var(--color-bad)]">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="text-sm text-[var(--color-good)]">
            {state.success}
          </p>
        ) : null}
      </div>
    </form>
  );
}
