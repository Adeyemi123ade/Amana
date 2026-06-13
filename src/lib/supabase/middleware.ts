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

  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify-email', '/verification', '/registration-success']
  // Theme page and business-info are onboarding — only check workspace for non-theme pages
  const onboardingExceptTheme = ['/onboarding/business-information', '/onboarding/identity-verification']

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r))
  const isOnboardingExceptTheme = onboardingExceptTheme.some(r => pathname.startsWith(r))

  // Not logged in → sign-in
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // Logged in on auth pages → dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Logged in on onboarding (not theme picker) → check workspace
  if (user && isOnboardingExceptTheme) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (workspace) {
      // Has workspace already — skip to theme if they haven't chosen, else dashboard
      const hasTheme = user.user_metadata?.theme
      const url = request.nextUrl.clone()
      url.pathname = hasTheme ? '/dashboard' : '/onboarding/theme'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
