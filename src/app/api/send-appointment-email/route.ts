import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const { appointmentId } = await req.json()
    if (!appointmentId) return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 })

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey || resendKey.includes('PASTE_YOUR')) {
      return NextResponse.json({ error: 'Email service not configured on this server.' }, { status: 500 })
    }

    const supabase = getSupabase()

    const { data: appt, error: apptErr } = await supabase
      .from('appointments').select('*').eq('id', appointmentId).single()
    if (apptErr || !appt) return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })

    const { data: cust } = await supabase
      .from('customers').select('*').eq('id', appt.customer_id).single()
    if (!cust?.email) return NextResponse.json({ error: 'Customer has no email address. Please add one in their profile.' }, { status: 400 })

    const { data: ws } = await supabase
      .from('workspaces').select('name, business_email').eq('id', appt.workspace_id).single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
    const appointmentLink = `${appUrl}/dashboard/appointments/${appointmentId}`

    const fmt  = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    const fmtT = (iso: string) => new Date(iso).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' })
    const isVirtual = appt.location_type !== 'PHYSICAL'

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111827">
        <div style="text-align:center;margin-bottom:28px">
          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;margin-right:10px;">
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
          <span style="font-size:20px;font-weight:800;color:#111827;vertical-align:middle">Amana</span>
        </div>

        <h2 style="font-size:20px;font-weight:800;color:#111827;margin-bottom:6px">
          Appointment Confirmation
        </h2>
        <p style="color:#6B7280;font-size:14px;margin-bottom:24px">
          Hello ${cust.name}, your appointment has been scheduled.
        </p>

        <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:20px;margin-bottom:20px">
          <p style="font-size:17px;font-weight:800;color:#7C3AED;margin-bottom:14px">${appt.title}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="color:#6B7280;padding:5px 0;width:110px">Date</td><td style="font-weight:600;color:#111827">${fmt(appt.start_time)}</td></tr>
            <tr><td style="color:#6B7280;padding:5px 0">Time</td><td style="font-weight:600;color:#111827">${fmtT(appt.start_time)}</td></tr>
            <tr><td style="color:#6B7280;padding:5px 0">Type</td><td style="font-weight:600;color:#111827">${isVirtual ? '💻 Virtual' : '📍 In-Person'}</td></tr>
            ${appt.location ? `<tr><td style="color:#6B7280;padding:5px 0">${isVirtual ? 'Meeting Link' : 'Address'}</td><td style="font-weight:600;color:#111827">${appt.location}</td></tr>` : ''}
            ${appt.notes ? `<tr><td style="color:#6B7280;padding:5px 0;vertical-align:top">Notes</td><td style="color:#374151">${appt.notes}</td></tr>` : ''}
          </table>
        </div>

        <a href="${appointmentLink}" style="display:block;background:#7C3AED;color:white;text-decoration:none;padding:13px 24px;border-radius:12px;font-size:14px;font-weight:700;text-align:center;margin-bottom:16px">
          View Appointment →
        </a>

        <p style="font-size:12px;color:#9CA3AF;text-align:center;margin-bottom:4px">
          Appointment link: <a href="${appointmentLink}" style="color:#7C3AED">${appointmentLink}</a>
        </p>

        <hr style="border:none;border-top:1px solid #F3F4F6;margin:20px 0"/>
        <p style="font-size:12px;color:#D1D5DB;text-align:center">
          Sent by ${ws?.name || 'Business'} via Amana
        </p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Amana Help Desk <noreply@chichatapp.com>',
        to: [cust.email],
        subject: `Your appointment with ${ws?.name || 'Business'} — ${appt.title}`,
        html,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.message || 'Could not send email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
