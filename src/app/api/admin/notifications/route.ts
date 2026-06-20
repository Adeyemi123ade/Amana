import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ notifications: [] })
    const db = getAdminSupabase()
    const { data } = await db.from('admin_notifications')
      .select('*')
      .eq('admin_email', user.email)
      .order('created_at', { ascending: false })
      .limit(30)
    return NextResponse.json({ notifications: data || [] })
  } catch {
    return NextResponse.json({ notifications: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json()
    const db = getAdminSupabase()
    if (action === 'read') {
      await db.from('admin_notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', id)
    } else if (action === 'unread_count') {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { count } = await db.from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('admin_email', user?.email || '')
        .eq('read', false)
      return NextResponse.json({ count: count || 0 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
