import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const adminEmails = ['admin@kajolacooperative.com', 'admin@amana.app']
  const isAdmin = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false

  // ── ADMIN ROUTES ──────────────────────────────────────────────
  // Not logged in → send to sign-in
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/sign-in', request.url))
    // Logged in but NOT an admin → send to their dashboard
    if (!isAdmin) return NextResponse.redirect(new URL('/dashboard', request.url))
    // Is admin — allow through
    return supabaseResponse
  }

  // ── CUSTOMER ROUTES ───────────────────────────────────────────
  // Not logged in → sign-in (for dashboard/onboarding)
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  if (!user && pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/sign-up', request.url))
  }

  // Logged in but email NOT verified → send to verify page
  // (except if already on verify-email or API routes)
  if (user && user.user_metadata?.email_verified === false) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }
  }

  // Logged in on sign-in/sign-up → dashboard (or admin for admin emails)
  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    // If email not verified, go to verify page
    if (user.user_metadata?.email_verified === false) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }
    // Admin emails go directly to admin dashboard
    const adminEmails = ['admin@kajolacooperative.com', 'admin@amana.app']
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Logged in, on onboarding, but workspace exists → dashboard
  if (user && pathname === '/onboarding/business-information') {
    const { data: ws, error } = await supabase
      .from('workspaces').select('id').eq('created_by', user.id).maybeSingle()
    if (!error && ws) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}
