import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/admin-auth'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ invoices: [], plan: null })

    // Get workspace for this user
    const { data: ws } = await supabase
      .from('workspaces')
      .select('id, name, business_email, plan, business_type, created_at')
      .eq('created_by', user.id)
      .maybeSingle()

    if (!ws) return NextResponse.json({ invoices: [], plan: null })

    // Use service role to read tenant_billing (RLS: no policies, service role only)
    const db = getAdminSupabase()
    const { data: invoices } = await db
      .from('tenant_billing')
      .select('*')
      .eq('workspace_id', ws.id)
      .order('created_at', { ascending: false })
      .limit(100)

    // Also mark all billing notifications as read
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('workspace_id', ws.id)
      .eq('type', 'billing')
      .catch(() => {})

    return NextResponse.json({
      invoices: invoices || [],
      workspace: ws,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
