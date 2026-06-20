import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    const db = getAdminSupabase()
    await db.from('support_messages').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin support error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
