import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { name, email, message, subject } = await req.json()
  if (!name || !email || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const db = getAdminSupabase()
  await db.from('support_messages').insert({ name, email, subject: subject || 'Website inquiry', message })
  return NextResponse.json({ success: true })
}
