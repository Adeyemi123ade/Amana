import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, logAdminAction } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const db = getAdminSupabase()
    const { data: businesses, error } = await db
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ businesses: businesses || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json()
    if (!id || !action) return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
    const db = getAdminSupabase()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await db.from('workspaces').update({
      suspended: action === 'suspend',
      suspended_at: action === 'suspend' ? new Date().toISOString() : null,
    }).eq('id', id)
    await logAdminAction(user?.email || 'admin', 'BUSINESS_' + action.toUpperCase(), 'workspace', id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
