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

  // 1. Not logged in trying to access dashboard → send to sign-in
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // 2. Not logged in trying to access onboarding → send to sign-up
  if (!user && pathname.startsWith('/onboarding')) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-up'
    return NextResponse.redirect(url)
  }

  // 3. Logged-in user visiting /sign-in or /sign-up
  //    Only redirect to dashboard if they have a COMPLETE setup (workspace + theme chosen)
  //    Otherwise let them through — they may need to finish onboarding
  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (workspace) {
      // Account fully set up — send to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    // No workspace yet — let them through to sign-up/sign-in
    // They may be mid-onboarding
  }

  // 4. Logged-in user visiting onboarding/business-information
  //    If they already have a workspace, skip to theme or dashboard
  if (user && pathname === '/onboarding/business-information') {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (workspace) {
      const hasTheme = user.user_metadata?.theme
      const url = request.nextUrl.clone()
      url.pathname = hasTheme ? '/dashboard' : '/onboarding/theme'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
