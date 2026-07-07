import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ThemeId } from '@/lib/theme/themes'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user

  if (error || !user) redirect('/sign-in')

  // Block access until the OTP email-verification step has actually been completed.
  // Supabase auto-confirm creates a live session at signUp() time, before the
  // 6-digit code is checked — without this gate, anyone who backs out of or
  // refreshes the /verify-email screen lands in the dashboard unverified.
  if (user.user_metadata?.email_verified !== true) {
    redirect('/verify-email')
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name, business_type')
    .eq('created_by', user.id)
    .maybeSingle()

  let fullName = user.user_metadata?.full_name || ''
  if (!fullName) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('supabase_id', user.id)
      .maybeSingle()
    if (profile?.full_name) fullName = profile.full_name
  }

  const displayName = workspace?.name || fullName || user.email || 'User'

  const enrichedUser = {
    ...user,
    user_metadata: {
      ...user.user_metadata,
      full_name: fullName || user.email,
      business_name: workspace?.name || '',
      display_name: displayName,
    }
  }

  const savedTheme = (user.user_metadata?.theme as ThemeId) || 'light'

  return (
    <ThemeProvider initialTheme={savedTheme}>
      <div className="dashboard-root">
        <Sidebar user={enrichedUser} />
        <div className="dashboard-main">
          <Topbar user={enrichedUser} />
          <main className="dashboard-content">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
