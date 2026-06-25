`import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ThemeId } from '@/lib/theme/themes'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/sign-in')

  // Get workspace to use business name as primary identity
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name, business_type')
    .eq('created_by', user.id)
    .maybeSingle()

  // Get personal name as fallback
  let fullName = user.user_metadata?.full_name || ''
  if (!fullName) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('supabase_id', user.id)
      .maybeSingle()
    if (profile?.full_name) fullName = profile.full_name
  }

  // Business name is primary — used in sidebar and greeting
  // Falls back to personal name if no workspace yet
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
