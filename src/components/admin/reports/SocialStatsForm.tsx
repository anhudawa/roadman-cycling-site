'use client';

import { useState, useTransition } from 'react';
import { saveSocialStatsAction } from '@/app/admin/inventory/sponsors/[sponsorId]/reports/[month]/actions';

interface Props {
  sponsorId: string;
  month: string;
  initial: { facebook: number | null; x: number | null; instagram: number | null };
}

export function SocialStatsForm({ sponsorId, month, initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="rounded-xl border border-white/10 bg-black/30 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await saveSocialStatsAction(sponsorId, month, fd);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        });
      }}
    >
      <h3 className="mb-4 font-[var(--font-bebas-neue)] text-2xl text-white">
        Enter Social Views for {month}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(['facebook', 'x', 'instagram'] as const).map((p) => (
          <label key={p} className="flex flex-col gap-1 text-sm text-white/70">
            <span className="uppercase tracking-widest">{p}</span>
            <input
              type="number"
              name={p}
              defaultValue={initial[p] ?? ''}
              min={0}
              className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md bg-[#F16363] px-4 py-2 font-semibold text-white hover:bg-[#e14d4d] disabled:opacity-50"
      >
        {pending ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
      </button>
    </form>
  );
}
