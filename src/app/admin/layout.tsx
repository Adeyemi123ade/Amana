import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/admin-auth'
import AdminClientLayout from './AdminClientLayout'

const SUPER_ADMIN_EMAILS = ['admin@kajolacooperative.com', 'admin@amana.app']

export const metadata = { title: 'Amana Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/sign-in')

  // Get this admin's role from platform_admins
  // Wrapped in try/catch — if table does not exist yet, super admins still get through
  const db = getAdminSupabase()
  let adminRow: any = null
  try {
    const { data } = await db
      .from('platform_admins')
      .select('role, display_name, active')
      .eq('email', user.email.toLowerCase())
      .maybeSingle()
    adminRow = data
  } catch {
    // Table may not exist yet — super admins bypass this check below
  }

  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())

  // Must be either super admin or active invited admin
  if (!isSuperAdmin && (!adminRow || !adminRow.active)) {
    redirect('/sign-in')
  }

  const role: string = isSuperAdmin
    ? (adminRow?.role || 'SUPER_ADMIN')
    : (adminRow?.role || 'ADMIN')

  return (
    <AdminClientLayout email={user.email!} role={role}>
      {children}
    </AdminClientLayout>
  )
}
