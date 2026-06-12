'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface TopbarProps { user: User }

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const fullName = user.user_metadata?.full_name || user.email || 'User'
  const firstName = fullName.split(' ')[0]
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const signOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header style={{height:64, background:'white', borderBottom:'1px solid #F3F4F6', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', flexShrink:0}}>
      <div style={{paddingLeft:0}} className="topbar-greeting">
        <p style={{fontSize:15, fontWeight:600, color:'#111827', marginBottom:1}}>
          {greeting}, {firstName} 👋
        </p>
        <p style={{fontSize:12, color:'#9CA3AF'}}>Here's what's happening with your business today.</p>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:10}}>
        {/* Bell */}
        <button style={{width:36, height:36, borderRadius:8, background:'none', border:'1px solid #F3F4F6', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span style={{position:'absolute', top:6, right:6, width:7, height:7, background:'#EF4444', borderRadius:'50%', border:'1.5px solid white'}}/>
        </button>

        {/* New button */}
        <Link href="/dashboard/invoices/create" style={{height:36, padding:'0 14px', background:'#7C3AED', color:'white', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:6}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New
        </Link>

        {/* Avatar + name */}
        <div style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}} onClick={signOut} title="Sign out">
          <div style={{width:34, height:34, borderRadius:'50%', background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#7C3AED'}}>
            {signingOut ? (
              <span style={{width:14, height:14, border:'2px solid #7C3AED', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>
            ) : initials}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .topbar-greeting p:last-child { display: none; }
        }
      `}</style>
    </header>
  )
}
