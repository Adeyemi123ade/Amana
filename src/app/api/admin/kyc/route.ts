import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, logAdminAction } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

async function getAdminEmail() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email || 'unknown'
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') || 'PENDING'
  const db = getAdminSupabase()

  const { data: subs } = await db
    .from('kyc_submissions')
    .select('*')
    .eq('status', status)
    .order('submitted_at', { ascending: false })

  if (!subs || subs.length === 0) {
    return NextResponse.json({ submissions: [] })
  }

  // Batch fetch all user emails in one call instead of N individual calls
  const userIds = [...new Set(subs.map((s: any) => s.user_id).filter(Boolean))]

  const emailMap: Record<string, string> = {}
  try {
    // Fetch users in parallel batches of 10 to stay within rate limits
    const BATCH = 10
    for (let i = 0; i < userIds.length; i += BATCH) {
      const batch = userIds.slice(i, i + BATCH)
      const results = await Promise.all(
        batch.map((uid: string) =>
          db.auth.admin.getUserById(uid).catch(() => ({ data: { user: null } }))
        )
      )
      results.forEach((r: any, idx: number) => {
        if (r.data?.user?.email) {
          emailMap[batch[idx]] = r.data.user.email
        }
      })
    }
  } catch {
    // Non-fatal — submissions still show, just without emails
  }

  const enriched = subs.map((s: any) => ({
    ...s,
    user_email: emailMap[s.user_id] || '—',
  }))

  return NextResponse.json({ submissions: enriched })
}

export async function POST(req: NextRequest) {
  const { id, action, reason, note } = await req.json()
  const db = getAdminSupabase()
  const adminEmail = await getAdminEmail()

  const { data: sub } = await db.from('kyc_submissions').select('*').eq('id', id).single()
  if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  await db.from('kyc_submissions').update({
    status: action,
    rejection_reason: reason || null,
    admin_note: note || null,
    reviewed_by: adminEmail,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id)

  await logAdminAction(adminEmail, 'KYC_' + action, 'kyc_submission', id, { reason, note })

  // Send email to user
  const { data: { user } } = await db.auth.admin.getUserById(sub.user_id).catch(() => ({ data: { user: null } }))
  const userEmail = user?.email
  const resendKey = process.env.RESEND_API_KEY
  if (userEmail && resendKey && !resendKey.includes('PASTE_YOUR')) {
    const subjectMap: Record<string, string> = {
      APPROVED: '✓ Your identity has been verified — Amana',
      REJECTED: 'Identity verification unsuccessful — Amana',
      NEEDS_UPDATE: 'Action required: Update your KYC submission — Amana',
    }
    const bodyMap: Record<string, string> = {
      APPROVED: `<h2 style="color:#16A34A">Identity Verified ✓</h2><p>Great news! Your identity has been successfully verified on Amana. You now have full access to all platform features.</p>`,
      REJECTED: `<h2 style="color:#DC2626">Verification Unsuccessful</h2><p>Unfortunately we could not verify your identity at this time.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}<p>Please resubmit with clear, valid documents.</p>`,
      NEEDS_UPDATE: `<h2 style="color:#7C3AED">Update Required</h2><p>We need additional information to complete your verification.</p>${reason ? `<p><strong>Details:</strong> ${reason}</p>` : ''}<p>Please log in and resubmit your KYC documents.</p>`,
    }
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Amana Help Desk <noreply@chichatapp.com>',
        to: [userEmail],
        subject: subjectMap[action] || 'KYC Update — Amana',
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px"><table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;text-align:center;width:100%">
  <tr><td style="text-align:center;padding-bottom:16px;">
    <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
      <tr><td style="background:#7C3AED;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;padding:0;">
        <table cellpadding="0" cellspacing="2" border="0" style="margin:0 auto;">
          <tr>
            <td style="background:white;width:10px;height:10px;border-radius:2px;"></td>
            <td style="background:white;width:10px;height:10px;border-radius:2px;"></td>
          </tr>
          <tr>
            <td style="background:white;width:10px;height:10px;border-radius:2px;"></td>
            <td style="background:white;width:10px;height:10px;border-radius:2px;"></td>
          </tr>
        </table>
      </td></tr>
    </table>
    <span style="font-size:18px;font-weight:800;color:#0E1A6E;vertical-align:middle;margin-left:10px;font-family:Arial,sans-serif;">Amana</span>
  </td></tr>
</table>${bodyMap[action]}<p style="color:#6B7280;font-size:12px;margin-top:24px">Amana Identity Verification Team</p></div>`,
      }),
    }).catch(console.error)
  }

  return NextResponse.json({ success: true })
}
