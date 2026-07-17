'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-deep-purple px-4">
      <div className="w-full max-w-md rounded-2xl bg-purple/40 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-5xl tracking-wider text-off-white">
            ROADMAN OS
          </h1>
          <p className="mt-2 font-body text-sm text-mid-grey">
            Content Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block font-body text-sm text-mid-grey"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-mid-grey/30 bg-charcoal px-4 py-2.5 font-body text-off-white placeholder:text-mid-grey/50 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
              placeholder="you@roadmancycling.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block font-body text-sm text-mid-grey"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-mid-grey/30 bg-charcoal px-4 py-2.5 font-body text-off-white placeholder:text-mid-grey/50 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="font-body text-sm text-coral">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-coral px-4 py-2.5 font-body font-semibold text-off-white transition-colors hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
