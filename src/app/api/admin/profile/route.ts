import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const db = getAdminSupabase()
    const { data } = await db.from('platform_admins').select('*').eq('email', user.email).maybeSingle()
    return NextResponse.json({ admin: data, email: user.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { display_name, phone, logo_url } = await req.json()
    const db = getAdminSupabase()
    await db.from('platform_admins').upsert({
      email: user.email,
      display_name: display_name || null,
      phone: phone || null,
      logo_url: logo_url || null,
    }, { onConflict: 'email' })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
