'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  sponsorId: string;
}

function currentMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1); // default to previous month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthsBack(n: number): { value: string; label: string }[] {
  const today = new Date();
  const out: { value: string; label: string }[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    out.push({ value, label });
  }
  return out;
}

export function MonthPicker({ sponsorId }: Props) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth());
  const options = monthsBack(12);

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/admin/inventory/sponsors/${sponsorId}/reports/${month}`);
        }}
        className="rounded-md bg-[#F16363] px-3 py-1 text-sm font-semibold text-white hover:bg-[#e14d4d]"
      >
        Report →
      </button>
    </div>
  );
}
