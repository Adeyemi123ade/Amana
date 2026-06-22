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
    const { email, name, role } = await req.json()
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    const db = getAdminSupabase()
    const { data: existing } = await db.from('platform_admins').select('id').eq('email', email.toLowerCase()).maybeSingle()
    if (existing) return NextResponse.json({ error: 'This email is already an admin' }, { status: 400 })
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
    const inviteUrl = appUrl + '/sign-up?admin_invite=' + token
    await db.from('platform_admins').insert({
      email: email.toLowerCase().trim(),
      display_name: name || null,
      role: role || 'ADMIN',
      invited_by: user.email,
      invite_token: token,
      active: false,
    })
    await logAdminAction(user.email, 'ADMIN_INVITED', 'platform_admin', email, { role })
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && !resendKey.includes('PASTE_YOUR')) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Amana Admin <noreply@chichatapp.com>',
          to: [email],
          subject: 'You have been invited to join Amana as an Admin',
          html: '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2>You have been invited as an Admin</h2><p>Invited by ' + user.email + ' as ' + (role || 'ADMIN') + '.</p><a href="' + inviteUrl + '" style="display:block;background:#0E1A6E;color:white;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700;text-align:center;margin:24px 0">Accept Invitation</a><p style="font-size:12px;color:#94A3B8">Register with ' + email + ' to gain admin access.</p></div>',
        }),
      }).catch(console.error)
    }
    return NextResponse.json({ success: true, inviteUrl })
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

    // Only SUPER_ADMINs can delete admins
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

    // Prevent removing hardcoded super admins
    if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ error: 'Cannot remove a Super Admin account' }, { status: 403 })
    }

    // Prevent self-deletion
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
