import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Missing email or code' }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #7C3AED; width: 36px; height: 36px; border-radius: 8px; margin-right: 8px;"></div>
          <span style="font-size: 20px; font-weight: bold; color: #111827; vertical-align: middle;">Amana</span>
        </div>
        <h2 style="font-size: 22px; font-weight: bold; color: #111827; margin-bottom: 8px; text-align: center;">Verify your email</h2>
        <p style="color: #6B7280; font-size: 15px; margin-bottom: 24px; text-align: center;">
          Enter this 6-digit code in the app to verify your email address.<br/>It expires in 10 minutes.
        </p>
        <div style="background: #F5F3FF; border: 2px solid #7C3AED; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #7C3AED; margin: 0;">${code}</p>
        </div>
        <p style="color: #9CA3AF; font-size: 13px; text-align: center;">
          If you did not create an Amana account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 24px 0;" />
        <p style="color: #D1D5DB; font-size: 11px; text-align: center;">Sent by Amana Help Desk</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Amana Help Desk <admin@amana.app>',
        to: [email],
        subject: 'Your Amana verification code',
        html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        error: 'Email delivery failed',
        detail: data?.message || data?.error || 'Unknown error',
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
