import { createClient } from '@supabase/supabase-js'
import type { Database } from './src/types/database'

async function test() {
  const supabase = createClient<Database>('url', 'key')
  
  // Test 1: simple select
  const { data: campaigns } = await supabase.from('campaigns').select('*')
  
  // Test 2: insert
  const { data: newCampaign } = await supabase
    .from('campaigns')
    .insert({
      title: 'Test',
      slug: 'test',
      type: 'weekly_focus' as const,
      status: 'draft' as const,
      description: null,
      goal: null,
      start_date: null,
      end_date: null,
      owner_id: null,
      sponsor_id: null,
      product_id: null,
      metadata: {},
    })
    .select()
    .single()
  
  if (newCampaign) {
    const id: string = newCampaign.id
  }
}
