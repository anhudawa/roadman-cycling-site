import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from './src/types/database'

async function test() {
  const supabase = createServerClient<Database>('url', 'key', {
    cookies: {
      getAll() { return [] },
      setAll(_cookies: { name: string; value: string; options: CookieOptions }[]) {},
    },
  })
  
  // Test insert
  const { data } = await supabase
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
  
  if (data) {
    const id: string = data.id
  }
}
