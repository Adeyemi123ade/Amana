import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, subject } = await req.json()
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Please fill in all fields' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const db = getAdminSupabase()

    // Save to support_messages for admin inbox
    await db.from('support_messages').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'Website enquiry',
      message: message.trim(),
    })

    // Send copy to the sender via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const logoTable = `<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr><td style="vertical-align:middle;">
          <table cellpadding="0" cellspacing="2" border="0" style="background:#7C3AED;border-radius:8px;width:36px;height:36px;display:inline-table;">
            <tr>
              <td style="background:white;width:9px;height:9px;border-radius:2px;"></td>
              <td style="width:2px;"></td>
              <td style="background:white;width:9px;height:9px;border-radius:2px;"></td>
            </tr>
            <tr><td colspan="3" style="height:2px;"></td></tr>
            <tr>
              <td style="background:white;width:9px;height:9px;border-radius:2px;"></td>
              <td style="width:2px;"></td>
              <td style="background:white;width:9px;height:9px;border-radius:2px;"></td>
            </tr>
          </table>
        </td>
        <td style="vertical-align:middle;padding-left:10px;font-size:20px;font-weight:800;color:#0E1A6E;font-family:Arial,sans-serif;">Amana</td>
        </tr>
      </table>`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Amana <noreply@chichatapp.com>',
          to: [email.trim()],
          subject: `We received your message — ${subject?.trim() || 'Website enquiry'}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 24px;background:#ffffff;">
              ${logoTable}
              <h2 style="font-size:18px;font-weight:700;color:#0F172A;margin-bottom:6px;">Thanks for reaching out, ${name.trim()}!</h2>
              <p style="font-size:14px;color:#64748B;line-height:1.6;margin-bottom:20px;">
                We have received your message and will get back to you shortly.
              </p>
              <div style="background:#F8FAFC;border-radius:10px;padding:16px 18px;border:1px solid #E2E8F0;margin-bottom:24px;">
                <p style="font-size:12px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Your message</p>
                <p style="font-size:14px;color:#1E293B;line-height:1.65;white-space:pre-wrap;">${message.trim()}</p>
              </div>
              <p style="font-size:13px;color:#94A3B8;border-top:1px solid #F1F5F9;padding-top:16px;margin-top:4px;">
                This is a copy of the message you sent via <a href="https://amana.app" style="color:#7C3AED;text-decoration:none;">amana.app</a>. 
                Please do not reply to this email — our team will contact you directly.
              </p>
            </div>
          `,
        }),
      }).catch(() => {}) // Non-fatal — message is already saved to DB
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
