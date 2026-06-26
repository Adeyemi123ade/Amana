import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Use service role to bypass RLS
    const db = getAdminSupabase()
    const { data, error } = await db
      .from('platform_admins')
      .select('*')
      .eq('email', user.email.toLowerCase())
      .maybeSingle()

    if (error) console.error('Profile GET error:', error)
    return NextResponse.json({ admin: data || null, email: user.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()
    const { display_name, phone, logo_url } = body

    // Use service role — required to write to platform_admins
    const db = getAdminSupabase()

    // Check if row exists
    const { data: existing } = await db
      .from('platform_admins')
      .select('id')
      .eq('email', user.email.toLowerCase())
      .maybeSingle()

    let result
    if (existing) {
      const updateData: any = {}
if (display_name !== undefined) updateData.display_name = display_name
if (phone !== undefined) updateData.phone = phone
if (logo_url !== undefined) updateData.logo_url = logo_url

result = await db
  .from('platform_admins')
  .update(updateData)
  .eq('email', user.email.toLowerCase())
    } else {
      result = await db
        .from('platform_admins')
        .insert({
          email: user.email.toLowerCase(),
          display_name: display_name || null,
          phone: phone || null,
          logo_url: logo_url || null,
          role: 'SUPER_ADMIN',
          active: true,
        })
    }

    if (result.error) {
      console.error('Profile save error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Profile POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
