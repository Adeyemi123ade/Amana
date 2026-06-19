import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'
import { isAdminEmail } from '@/lib/admin-auth'

export const metadata = { title: 'Amana Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    redirect('/sign-in')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <AdminSidebar email={user.email!} />
      <main style={{ flex: 1, padding: 28, overflowY: 'auto', maxHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
