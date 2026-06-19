import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, logAdminAction } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const db = getAdminSupabase()
  const { data } = await db.from('platform_admins').select('*').order('created_at', { ascending: true })
  return NextResponse.json({ admins: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { email, name, role } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const db = getAdminSupabase()

  // Check not already an admin
  const { data: existing } = await db.from('platform_admins').select('id').eq('email', email.toLowerCase()).maybeSingle()
  if (existing) return NextResponse.json({ error: 'This email is already an admin' }, { status: 400 })

  // Generate invite token
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
  const inviteUrl = `${appUrl}/sign-up?admin_invite=${token}`

  await db.from('platform_admins').insert({
    email: email.toLowerCase().trim(),
    display_name: name || null,
    role: role || 'ADMIN',
    invited_by: user.email,
    invite_token: token,
    active: false,
  })

  await logAdminAction(user.email, 'ADMIN_INVITED', 'platform_admin', email, { role })

  // Send invite email
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && !resendKey.includes('PASTE_YOUR')) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Amana Admin <noreply@chichatapp.com>',
        to: [email],
        subject: 'You have been invited to join Amana as an Admin',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <div style="text-align:center;margin-bottom:24px">
              <div style="display:inline-block;background:#0E1A6E;width:36px;height:36px;border-radius:9px;margin-right:8px;vertical-align:middle"></div>
              <span style="font-size:20px;font-weight:800;color:#111827;vertical-align:middle">Amana Admin</span>
            </div>
            <h2 style="color:#0F172A">You have been invited as an Admin</h2>
            <p style="color:#64748B">You have been invited by <strong>${user.email}</strong> to join the Amana platform as an administrator with <strong>${role || 'ADMIN'}</strong> access.</p>
            <a href="${inviteUrl}" style="display:block;background:#0E1A6E;color:white;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:15px;font-weight:700;text-align:center;margin:24px 0">
              Accept Invitation →
            </a>
            <p style="font-size:12px;color:#94A3B8">Register with this email address (${email}) to gain admin access.</p>
          </div>
        `,
      }),
    }).catch(console.error)
  }

  return NextResponse.json({ success: true, inviteUrl })
}

export async function DELETE(req: NextRequest) {
  const { email } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const db = getAdminSupabase()
  await db.from('platform_admins').delete().eq('email', email).neq('email', user?.email || '')
  await logAdminAction(user?.email || 'admin', 'ADMIN_REMOVED', 'platform_admin', email)
  return NextResponse.json({ success: true })
}
