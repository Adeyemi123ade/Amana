import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPER_ADMIN_EMAILS = ['admin@kajolacooperative.com', 'admin@amana.app']

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email?.toLowerCase() || ''

      // Super admins go to /admin
      if (SUPER_ADMIN_EMAILS.includes(email)) {
        return NextResponse.redirect(`${origin}/admin`)
      }

      // Check platform_admins table for invited admins
      try {
        const db = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await db
          .from('platform_admins')
          .select('id')
          .eq('email', email)
          .eq('active', true)
          .maybeSingle()
        if (data) return NextResponse.redirect(`${origin}/admin`)
      } catch {
        // Table may not exist — continue to normal routing
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
