import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, logAdminAction } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const db = getAdminSupabase()

    // Active admins
    const { data: admins } = await db
      .from('platform_admins')
      .select('*')
      .order('created_at', { ascending: true })

    // Pending invites (not yet accepted)
    const { data: invites } = await db
      .from('admin_invites')
      .select('id, email, display_name, role, invited_by, created_at, expires_at')
      .order('created_at', { ascending: true })

    return NextResponse.json({ admins: admins || [], invites: invites || [] })
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

    // Check not already an active admin
    const { data: existingAdmin } = await db
      .from('platform_admins')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existingAdmin) {
      return NextResponse.json({ error: 'This email is already an active admin' }, { status: 400 })
    }

    // Check not already a pending invite — replace if exists (resend)
    await db.from('admin_invites').delete().eq('email', email.toLowerCase().trim())

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
    const inviteUrl = `${appUrl}/admin-invite/${token}`

    // Store in admin_invites only — platform_admins is NOT touched yet
    const { error: insertError } = await db.from('admin_invites').insert({
      email: email.toLowerCase().trim(),
      display_name: name || null,
      role: role || 'ADMIN',
      invited_by: user.email,
      invite_token: token,
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await logAdminAction(user.email, 'ADMIN_INVITE_PREPARED', 'admin_invites', email, { role })

    return NextResponse.json({ success: true, inviteUrl, inviterEmail: user.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email, type } = await req.json()
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

    // type='invite' cancels a pending invite; default removes active admin
    if (type === 'invite') {
      await db.from('admin_invites').delete().eq('email', email.toLowerCase())
      await logAdminAction(user.email, 'ADMIN_INVITE_CANCELLED', 'admin_invites', email, {})
    } else {
      if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
        return NextResponse.json({ error: 'Cannot remove a Super Admin account' }, { status: 403 })
      }
      if (email.toLowerCase() === user.email.toLowerCase()) {
        return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 })
      }
      await db.from('platform_admins').delete().eq('email', email.toLowerCase())
      await logAdminAction(user.email, 'ADMIN_REMOVED', 'platform_admin', email, {})
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
