'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Next.js always serves a client-cached copy of a page on browser back/forward
// navigation (to preserve scroll position), even for pages that check things like
// auth, workspace existence, or payment status server-side. That means back/forward
// can show a stale render that skips those checks entirely.
//
// This listens for the browser's popstate event (fired on every back/forward) and
// forces Next.js to re-fetch the current route fresh from the server, so redirects
// and data checks in server components always run again after back/forward.
export default function BackForwardRefresh() {
  const router = useRouter()

  useEffect(() => {
    const handlePopState = () => router.refresh()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [router])

  return null
}
