import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // SUPPORT REPLY mode: called from admin support page
    // Fields: to, subject, body, from_name
    if (body.to && body.body) {
      const { to, subject, body: msgBody, from_name } = body
      if (!to?.trim() || !msgBody?.trim()) {
        return NextResponse.json({ error: 'Recipient email and message body are required' }, { status: 400 })
      }

      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey || resendKey.includes('PASTE_YOUR')) {
        return NextResponse.json({ error: 'Email service not configured. Contact your system administrator.' }, { status: 500 })
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Amana Support <noreply@chichatapp.com>',
          to: [to.trim()],
          subject: subject || 'Reply from Amana Support',
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
            <div style="margin-bottom:20px">
              <span style="font-size:20px;font-weight:800;color:#0E1A6E">Amana Support</span>
            </div>
            <div style="background:#F8FAFC;border-radius:10px;padding:16px 18px;border:1px solid #E2E8F0;margin-bottom:20px;white-space:pre-wrap;font-size:14px;color:#1E293B;line-height:1.7">
              ${msgBody.trim().replace(/\n/g, '<br/>')}
            </div>
            <p style="font-size:12px;color:#94A3B8;border-top:1px solid #F1F5F9;padding-top:16px">
              This email was sent by ${from_name || 'Amana Support'}. Please reply to this email if you have further questions.
            </p>
          </div>`,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return NextResponse.json({ error: err.message || 'Email delivery failed. Please try again.' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // CONTACT FORM mode: called from landing page or business side
    // Fields: name, email, message, subject
    const { name, email, message, subject } = body
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Please fill in all fields' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const db = getAdminSupabase()
    await db.from('support_messages').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'Website enquiry',
      message: message.trim(),
    })

    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && !resendKey.includes('PASTE_YOUR')) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Amana <noreply@chichatapp.com>',
          to: [email.trim()],
          subject: `We received your message — ${subject?.trim() || 'Website enquiry'}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 24px">
            <h2 style="font-size:18px;font-weight:700;color:#0F172A;margin-bottom:6px">Thanks for reaching out, ${name.trim()}!</h2>
            <p style="font-size:14px;color:#64748B;line-height:1.6;margin-bottom:20px">We have received your message and will get back to you shortly.</p>
            <div style="background:#F8FAFC;border-radius:10px;padding:16px 18px;border:1px solid #E2E8F0;margin-bottom:24px">
              <p style="font-size:12px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Your message</p>
              <p style="font-size:14px;color:#1E293B;line-height:1.65;white-space:pre-wrap">${message.trim()}</p>
            </div>
            <p style="font-size:13px;color:#94A3B8">Please do not reply to this email — our team will contact you directly.</p>
          </div>`,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
