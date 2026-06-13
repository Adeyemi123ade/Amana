import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/sign-in')

  // Pull name from users table if metadata is empty
  let fullName = user.user_metadata?.full_name || ''
  if (!fullName) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('supabase_id', user.id)
      .single()
    if (profile?.full_name) fullName = profile.full_name
  }

  const enrichedUser = {
    ...user,
    user_metadata: {
      ...user.user_metadata,
      full_name: fullName || user.email,
    }
  }

  return (
    <div className="dashboard-root">
      <Sidebar user={enrichedUser} />
      <div className="dashboard-main">
        <Topbar user={enrichedUser} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}
