import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'

export async function GET() {
  try {
    const db = getAdminSupabase()
    const { data: payments, error } = await db
      .from('payments')
      .select('*, workspaces(name)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return NextResponse.json({ payments: payments || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
