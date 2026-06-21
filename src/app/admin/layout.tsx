import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase, SUPER_ADMIN_EMAILS } from '@/lib/admin-auth'
import AdminClientLayout from './AdminClientLayout'

export const metadata = { title: 'Amana Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    console.log('[AdminLayout] starting')

    const supabase = await createClient()
    console.log('[AdminLayout] supabase client created')

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    console.log('[AdminLayout] getUser done, email:', user?.email, 'error:', userErr?.message)

    if (!user?.email) {
      console.log('[AdminLayout] no user, redirecting to sign-in')
      redirect('/sign-in')
    }

    const db = getAdminSupabase()
    console.log('[AdminLayout] admin supabase client created')

    let adminRow: any = null
    try {
      const { data, error } = await db
        .from('platform_admins')
        .select('role, display_name, active')
        .eq('email', user.email.toLowerCase())
        .maybeSingle()
      console.log('[AdminLayout] platform_admins query done, data:', JSON.stringify(data), 'error:', error?.message)
      adminRow = data
    } catch (e: any) {
      console.log('[AdminLayout] platform_admins query threw:', e?.message)
    }

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())
    console.log('[AdminLayout] isSuperAdmin:', isSuperAdmin)

    if (!isSuperAdmin && (!adminRow || !adminRow.active)) {
      console.log('[AdminLayout] not admin, redirecting to sign-in')
      redirect('/sign-in')
    }

    const role: string = isSuperAdmin
      ? (adminRow?.role || 'SUPER_ADMIN')
      : (adminRow?.role || 'ADMIN')

    console.log('[AdminLayout] rendering layout with role:', role)

    return (
      <AdminClientLayout email={user.email!} role={role}>
        {children}
      </AdminClientLayout>
    )
  } catch (e: any) {
    // If it's a redirect, re-throw it — Next.js needs that
    if (e?.message === 'NEXT_REDIRECT' || e?.digest?.startsWith('NEXT_REDIRECT')) throw e
    console.error('[AdminLayout] CRASH:', e?.message, e?.stack)
    throw e
  }
}
