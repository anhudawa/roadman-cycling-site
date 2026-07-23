'use client'

import { ToastProvider } from '@/components/ui/Toast'

/**
 * Client-side wrapper for the ToastProvider.
 * Used in the app layout to provide toast notifications to all pages.
 */
export function ToastWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
