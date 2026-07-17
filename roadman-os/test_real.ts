import { createClient } from '@supabase/supabase-js'

type Database = {
  public: {
    Tables: {
      test: {
        Row: { id: string; name: string; created_at: string }
        Insert: { name: string }
        Update: { name?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: { test_enum: 'a' | 'b' }
  }
}

async function test() {
  const supabase = createClient<Database>('url', 'key')
  const { data, error } = await supabase
    .from('test')
    .insert({ name: 'hello' })
    .select()
    .single()
  
  if (data) {
    const id: string = data.id
  }
}
