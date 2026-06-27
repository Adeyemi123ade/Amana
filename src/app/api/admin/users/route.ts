import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'

export async function GET() {
  try {
    const db = getAdminSupabase()
    const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 500 })
    if (error) throw error
    return NextResponse.json({ users: data?.users || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
