'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Plus, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'

interface TopbarProps {
  user: User
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const name = user.user_metadata?.full_name || user.email || 'User'
  const initials = getInitials(name)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 flex-shrink-0">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          {greeting}, {name.split(' ')[0]} 👋
        </h2>
        <p className="text-xs text-gray-500">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New
        </Button>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold hover:bg-purple-200 transition-colors disabled:opacity-50"
          title="Sign out"
        >
          {signingOut ? <LogOut className="h-4 w-4" /> : initials}
        </button>
      </div>
    </header>
  )
}
