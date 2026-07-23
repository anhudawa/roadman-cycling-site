import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/import/status/[jobId]
// ---------------------------------------------------------------------------

/**
 * Poll the status of a bulk import job.
 *
 * Returns the sync_job record including progress metadata:
 * - status: 'pending' | 'running' | 'completed' | 'failed'
 * - metadata.current: current item index
 * - metadata.total: total items to process
 * - metadata.currentTitle: title of the item currently being processed
 * - records_synced: number of records successfully imported
 * - error_message: any errors encountered
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: syncJob, error } = await supabase
    .from('sync_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !syncJob) {
    return NextResponse.json({ error: 'Sync job not found' }, { status: 404 })
  }

  return NextResponse.json(syncJob)
}
