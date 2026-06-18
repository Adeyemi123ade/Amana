import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Must use service role to bypass RLS on team_invites insert
// The anon key cannot insert because RLS requires workspace ownership check
// which only works when the request comes from an authenticated browser session
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, workspaceId, invitedBy, workspaceName } = await request.json()

    if (!email || !workspaceId || !invitedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Verify workspaceId belongs to invitedBy (manual ownership check)
    const { data: wsCheck } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('created_by', invitedBy)
      .maybeSingle()

    if (!wsCheck) {
      return NextResponse.json({ error: 'You do not have permission to invite to this workspace' }, { status: 403 })
    }

    // Check for existing pending invite
    const { data: existing } = await supabase
      .from('team_invites')
      .select('id, status, expires_at')
      .eq('workspace_id', workspaceId)
      .eq('email', email.toLowerCase())
      .eq('status', 'PENDING')
      .maybeSingle()

    if (existing && new Date(existing.expires_at) > new Date()) {
      return NextResponse.json({ error: 'An active invite already exists for this email' }, { status: 409 })
    }

    // Create invite
    const { data: invite, error } = await supabase
      .from('team_invites')
      .insert({
        workspace_id: workspaceId,
        invited_by: invitedBy,
        email: email.toLowerCase().trim(),
        role: 'MEMBER',
      })
      .select()
      .single()

    if (error || !invite) {
      const reason = error?.code === '42P01' ? 'Team invites table does not exist. Run phase4_schema.sql in Supabase.'
        : error?.code === '23503' ? 'Invalid workspace or user reference.'
        : error?.code === '42501' ? 'Permission denied. Check RLS policies.'
        : error?.message || 'Could not create invite'
      return NextResponse.json({ error: reason }, { status: 500 })
    }

    // Send invite email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && !resendKey.includes('PASTE_YOUR')) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
      const acceptUrl = `${appUrl}/join/${invite.token}`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Amana Help Desk <noreply@chichatapp.com>',
          to: [email],
          subject: `You have been invited to join ${workspaceName} on Amana`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <div style="text-align:center;margin-bottom:24px">
                <div style="display:inline-block;background:#7C3AED;width:36px;height:36px;border-radius:9px;margin-right:8px;vertical-align:middle"></div>
                <span style="font-size:20px;font-weight:800;color:#111827;vertical-align:middle">Amana</span>
              </div>
              <h2 style="font-size:20px;color:#111827;margin-bottom:8px">You have been invited!</h2>
              <p style="color:#6B7280;font-size:14px;margin-bottom:20px">
                You have been invited to join <strong>${workspaceName}</strong> as a team member on Amana.
              </p>
              <a href="${acceptUrl}" style="display:block;background:#7C3AED;color:white;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:15px;font-weight:700;text-align:center;margin-bottom:16px">
                Accept Invitation →
              </a>
              <p style="font-size:12px;color:#9CA3AF;text-align:center">
                This invitation expires in 7 days. If you did not expect this, you can safely ignore it.
              </p>
              <hr style="border:none;border-top:1px solid #F3F4F6;margin:20px 0"/>
              <p style="font-size:11px;color:#D1D5DB;text-align:center">Sent by Amana</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, inviteId: invite.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
