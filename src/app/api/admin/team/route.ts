import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, logAdminAction } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const db = getAdminSupabase()
    const { data } = await db.from('platform_admins').select('*').order('created_at', { ascending: true })
    return NextResponse.json({ admins: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { email, name, role, action } = await req.json()
    const db = getAdminSupabase()

    // MARK_SENT: called after admin has opened their email app and sent the invite manually
    if (action === 'MARK_SENT') {
      await db.from('platform_admins')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('email', email?.toLowerCase())
      await logAdminAction(user.email, 'ADMIN_INVITE_EMAIL_OPENED', 'platform_admin', email, {})
      return NextResponse.json({ success: true })
    }

    // Default: PREPARE — create the DB record and return invite URL + mailto link
    // No email is sent here. The admin opens their email app themselves.
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const { data: existing } = await db
      .from('platform_admins')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) return NextResponse.json({ error: 'This email is already an admin' }, { status: 400 })

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
    const inviteUrl = `${appUrl}/admin-invite/${token}`

    await db.from('platform_admins').insert({
      email: email.toLowerCase().trim(),
      display_name: name || null,
      role: role || 'ADMIN',
      invited_by: user.email,
      invite_token: token,
      active: false,
    })

    await logAdminAction(user.email, 'ADMIN_INVITED', 'platform_admin', email, { role })

    return NextResponse.json({ success: true, inviteUrl, inviterEmail: user.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const db = getAdminSupabase()

    const { data: requester } = await db
      .from('platform_admins')
      .select('role')
      .eq('email', user.email.toLowerCase())
      .maybeSingle()

    const SUPER_ADMIN_EMAILS = ['admin@amana.app', 'admin@kajolacooperative.com']
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) ||
      requester?.role === 'SUPER_ADMIN'

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Only Super Admins can remove team members' }, { status: 403 })
    }

    if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ error: 'Cannot remove a Super Admin account' }, { status: 403 })
    }

    if (email.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 })
    }

    await db.from('platform_admins').delete().eq('email', email.toLowerCase())
    await logAdminAction(user.email, 'ADMIN_REMOVED', 'platform_admin', email)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
