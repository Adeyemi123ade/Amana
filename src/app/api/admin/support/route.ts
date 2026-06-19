import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'
export async function POST(req: NextRequest) {
  const { id, status } = await req.json()
  const db = getAdminSupabase()
  await db.from('support_messages').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ success: true })
}
