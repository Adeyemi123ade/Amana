import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, logAdminAction } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { id, action } = await req.json()
  const db = getAdminSupabase()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await db.from('workspaces').update({
    suspended: action === 'suspend',
    suspended_at: action === 'suspend' ? new Date().toISOString() : null,
  }).eq('id', id)

  await logAdminAction(user?.email || 'admin', 'BUSINESS_' + action.toUpperCase(), 'workspace', id)
  return NextResponse.json({ success: true })
}
