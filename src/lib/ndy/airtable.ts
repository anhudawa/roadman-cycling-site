import {
  createRecords,
  mapFieldsToAirtable,
  type AirtableRecord,
} from '@/lib/inventory/airtable';
import type { NdyProspectRecord } from './types';

const TABLE_NAME = 'ndy_prospects';

export async function createProspect(
  record: NdyProspectRecord,
): Promise<AirtableRecord> {
  const fields = mapFieldsToAirtable(record as unknown as Record<string, unknown>);
  const created = await createRecords(TABLE_NAME, [fields]);
  return created[0];
}
