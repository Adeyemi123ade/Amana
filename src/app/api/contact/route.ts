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
    await db.from('support_messages').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'Website enquiry',
      message: message.trim(),
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
