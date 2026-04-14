'use server';

import { revalidatePath } from 'next/cache';
import { upsertSocialStats } from '@/lib/reports/social-stats';

export async function saveSocialStatsAction(
  sponsorId: string,
  month: string,
  form: FormData,
): Promise<void> {
  const facebook = parseInt(String(form.get('facebook') ?? ''), 10);
  const x = parseInt(String(form.get('x') ?? ''), 10);
  const instagram = parseInt(String(form.get('instagram') ?? ''), 10);

  const entries = [
    { platform: 'facebook' as const, views: facebook },
    { platform: 'x' as const, views: x },
    { platform: 'instagram' as const, views: instagram },
  ].filter((e) => Number.isFinite(e.views) && e.views >= 0);

  await upsertSocialStats(month, entries);
  revalidatePath(`/admin/inventory/sponsors/${sponsorId}/reports/${month}`);
}
