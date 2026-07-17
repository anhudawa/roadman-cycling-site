import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// No-op stub for demo mode — every chained Supabase query resolves to empty results.
// The ROOT proxy is NOT thenable (so `await createClient()` returns it as-is).
// The QUERY BUILDER returned by .from()/.select()/etc. IS thenable (so `await query` works).
function createDemoProxy(): any {
  const result = { data: null, error: null, count: 0 }

  // Query builder — thenable, so `await supabase.from(…).select(…)` resolves to result
  function qb(): any {
    return new Proxy({}, {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (v: any) => void) => resolve(result)
        }
        return (..._args: any[]) => qb()
      },
    })
  }

  // Root client — NOT thenable (no .then), so `await createClient()` returns this object
  return new Proxy({}, {
    get(_target, prop) {
      if (prop === 'then') return undefined  // prevent await-unwrapping
      return (..._args: any[]) => qb()
    },
  })
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return createDemoProxy()
  }
  const cookieStore = await cookies()

  return createServerClient<Database>(url, key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component
            // where cookies cannot be set. This can be ignored if
            // middleware refreshes the session.
          }
        },
      },
    }
  )
}
