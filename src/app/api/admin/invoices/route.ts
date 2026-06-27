import { NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'

export async function GET() {
  try {
    const db = getAdminSupabase()
    const { data: invoices, error } = await db
      .from('invoices')
      .select('*, customers(name,email), workspaces(name)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return NextResponse.json({ invoices: invoices || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
