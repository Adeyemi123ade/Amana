import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'

// Called by the sign-in page to check if an email belongs to an active platform admin
// This enables the back button fix for invited admins (not just hardcoded super admins)
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ isAdmin: false })
  try {
    const db = getAdminSupabase()
    const { data } = await db
      .from('platform_admins')
      .select('active')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    return NextResponse.json({ isAdmin: !!data?.active })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}
