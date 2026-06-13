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

  // Not logged in → sign-in
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // Not logged in → sign-up
  if (!user && pathname.startsWith('/onboarding')) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-up'
    return NextResponse.redirect(url)
  }

  // Logged in on sign-in or sign-up → dashboard
  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // CRITICAL: Logged in user visiting onboarding/business-information
  // Check if they already have a workspace — if yes, send to dashboard
  // This prevents the business info page from appearing again after setup
  if (user && pathname === '/onboarding/business-information') {
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('id')
      .eq('created_by', user.id)
      .maybeSingle()

    // Only redirect if we CONFIRMED a workspace exists (no error, has data)
    if (!error && workspace) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    // If error or no workspace — let them through to fill business info
  }

  return supabaseResponse
}
