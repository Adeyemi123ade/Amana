import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

// Hardcoded super admins — always have access regardless of DB state
const SUPER_ADMIN_EMAILS = ['admin@kajolacooperative.com', 'admin@amana.app']

// Check platform_admins table for invited/active admins
async function checkPlatformAdmin(email: string): Promise<boolean> {
  try {
    const db = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await db
      .from('platform_admins')
      .select('id, active')
      .eq('email', email.toLowerCase())
      .eq('active', true)
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}

// Activate a pending invited admin on first sign-in
async function activatePendingAdmin(email: string, userId: string): Promise<boolean> {
  try {
    const db = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    // Check if there's a pending (active=false) invite for this email
    const { data: pending } = await db
      .from('platform_admins')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('active', false)
      .maybeSingle()

    if (pending) {
      // Activate — they accepted the invite by registering
      await db
        .from('platform_admins')
        .update({ active: true, user_id: userId })
        .eq('id', pending.id)
      return true
    }
    return false
  } catch {
    return false
  }
}

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

  const isSuperAdmin = user?.email
    ? SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())
    : false

  // ── ADMIN ROUTES ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/sign-in', request.url))

    // Super admins always allowed
    if (isSuperAdmin) return supabaseResponse

    // Check platform_admins table for invited admins
    const isInvitedAdmin = await checkPlatformAdmin(user.email!)
    if (isInvitedAdmin) return supabaseResponse

    // Check if they have a pending invite — activate it (first sign-in after invite)
    const activated = await activatePendingAdmin(user.email!, user.id)
    if (activated) return supabaseResponse

    // Not an admin at all → back to customer dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── CUSTOMER ROUTES ───────────────────────────────────────────
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  if (!user && pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/sign-up', request.url))
  }

  if (user && user.user_metadata?.email_verified === false) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }
  }

  // Logged in on sign-in/sign-up → route correctly
  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    if (user.user_metadata?.email_verified === false) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }

    // Super admin → /admin
    if (isSuperAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Check if they are an active invited admin
    const isInvitedAdmin = await checkPlatformAdmin(user.email!)
    if (isInvitedAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Check if pending invite — activate and redirect to admin
    const activated = await activatePendingAdmin(user.email!, user.id)
    if (activated) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Regular customer → dashboard
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

  // Logged in, on dashboard, but no workspace yet → onboarding
  if (user && pathname.startsWith('/dashboard')) {
    const { data: ws, error } = await supabase
      .from('workspaces').select('id').eq('created_by', user.id).maybeSingle()
    if (!error && !ws) {
      return NextResponse.redirect(new URL('/onboarding/business-information', request.url))
    }
  }

  return supabaseResponse
}
