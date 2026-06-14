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

  // Logged in on sign-in/sign-up → dashboard
  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    // If email not verified, go to verify page
    if (user.user_metadata?.email_verified === false) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
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
