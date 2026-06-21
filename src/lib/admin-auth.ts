import { createClient } from '@supabase/supabase-js'

// Single source of truth for super admin emails.
// Import this constant everywhere — never hardcode elsewhere.
export const SUPER_ADMIN_EMAILS = [
  'admin@amana.app',
  'admin@kajolacooperative.com',
]

export function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

export function isSuperAdmin(email: string | undefined): boolean {
  return isAdminEmail(email)
}

// Check DB for invited admins (use in server components only)
export async function isActiveAdmin(email: string): Promise<boolean> {
  if (isAdminEmail(email)) return true
  try {
    const db = getAdminSupabase()
    const { data } = await db
      .from('platform_admins')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('active', true)
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}

export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details: any = {},
  ip?: string
) {
  try {
    const db = getAdminSupabase()
    await db.from('admin_logs').insert({
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ip,
    })
  } catch (e) {
    console.error('logAdminAction failed:', e)
  }
}
