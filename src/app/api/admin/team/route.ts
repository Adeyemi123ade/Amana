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

    const { data: existing } = await db
      .from('platform_admins')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) return NextResponse.json({ error: 'This email is already an admin' }, { status: 400 })

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'

    // Points to the dedicated admin registration page
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

    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && !resendKey.includes('PASTE_YOUR')) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Amana Admin <noreply@chichatapp.com>',
          to: [email],
          subject: 'You have been invited to join Amana as an Admin',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <div style="text-align:center;margin-bottom:24px">
                <div style="width:48px;height:48px;background:#0E1A6E;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px">
                  <table cellpadding="0" cellspacing="3" border="0" style="margin:0 auto">
                    <tr>
                      <td style="background:white;width:9px;height:9px;border-radius:2px"></td>
                      <td style="background:white;width:9px;height:9px;border-radius:2px"></td>
                    </tr>
                    <tr>
                      <td style="background:white;width:9px;height:9px;border-radius:2px"></td>
                      <td style="background:white;width:9px;height:9px;border-radius:2px"></td>
                    </tr>
                  </table>
                </div>
                <h1 style="font-size:22px;font-weight:800;color:#0F172A;margin:0">Amana Admin</h1>
              </div>
              <h2 style="font-size:18px;color:#0F172A;margin-bottom:8px">You have been invited!</h2>
              <p style="color:#64748B;font-size:14px;margin-bottom:8px">
                <strong>${user.email}</strong> has invited you to join the Amana Admin Dashboard as <strong>${role || 'ADMIN'}</strong>.
              </p>
              <p style="color:#64748B;font-size:14px;margin-bottom:24px">
                Click the button below to create your admin account. You will set your own password on the next screen.
              </p>
              <a href="${inviteUrl}" style="display:block;background:#0E1A6E;color:white;text-decoration:none;padding:16px 24px;border-radius:12px;font-weight:700;font-size:15px;text-align:center;margin-bottom:16px">
                Accept Invitation and Create Account
              </a>
              <p style="font-size:12px;color:#94A3B8;text-align:center;margin-bottom:4px">
                You will sign in with: <strong>${email}</strong>
              </p>
              <p style="font-size:11px;color:#CBD5E1;text-align:center">
                If you did not expect this invitation, you can safely ignore this email.
              </p>
            </div>
          `,
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