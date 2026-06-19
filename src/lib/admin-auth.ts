import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = [
  'admin@kajolacooperative.com',
  'admin@amana.app',
]

export function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function isAdminEmail(email: string | undefined) {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details: any = {},
  ip?: string
) {
  const supabase = getAdminSupabase()
  await supabase.from('admin_logs').insert({
    admin_email: adminEmail,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
    ip_address: ip,
  })
}
