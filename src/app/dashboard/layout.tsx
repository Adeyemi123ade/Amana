import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/sign-in')

  // Get full name from users table if metadata is empty
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
    <div style={{display:'flex', height:'100vh', background:'#F9FAFB', overflow:'hidden'}}>
      <Sidebar user={enrichedUser} />
      <div style={{display:'flex', flex:1, flexDirection:'column', overflow:'hidden', minWidth:0}}>
        <Topbar user={enrichedUser} />
        <main style={{flex:1, overflowY:'auto'}}>
          <div style={{maxWidth:1280, margin:'0 auto', padding:'24px 24px'}}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
