'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href:'/dashboard', label:'Dashboard', exact:true, icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href:'/dashboard/invoices', label:'Invoices', icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href:'/dashboard/customers', label:'Customers', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href:'/dashboard/appointments', label:'Appointments', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href:'/dashboard/payments', label:'Payments', icon:'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { href:'/dashboard/recurring', label:'Recurring', icon:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { href:'/dashboard/reminders', label:'Reminders', icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { href:'/dashboard/reports', label:'Reports', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href:'/dashboard/settings', label:'Settings', icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

// ── Correct Amana logo — matches landing page exactly ──
function AmanaLogo({ size = 34 }: { size?: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:size, height:size, background:'#7C3AED', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white"/>
          <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white"/>
          <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white"/>
          <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white"/>
        </svg>
      </div>
      <span style={{ color:'white', fontWeight:800, fontSize: size === 30 ? 15 : 17, letterSpacing:-0.5 }}>Amana</span>
    </div>
  )
}

interface SidebarProps { user: User }

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const fullName = user.user_metadata?.full_name || user.email || 'User'
  const email = user.email || ''
  const businessName = user.user_metadata?.business_name || fullName
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const signOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const NavContent = ({ onNav }: { onNav?: () => void }) => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Logo */}
      <div style={{ padding:'18px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
        <AmanaLogo size={34} />
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px', overflowY:'auto' }}>
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link key={item.href} href={item.href} onClick={onNav}
              style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 12px', borderRadius:10, marginBottom:2, textDecoration:'none', background: active ? '#7C3AED' : 'transparent', color: active ? 'white' : '#9CA3AF', fontWeight: active ? 600 : 400, fontSize:14, transition:'background 0.15s, color 0.15s', whiteSpace:'nowrap' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d={item.icon}/>
              </svg>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User bottom */}
      <div style={{ padding:'12px 14px', borderTop:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:12, fontWeight:700, color:'white' }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:'white', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{businessName || fullName}</p>
            <p style={{ color:'#6B7280', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{businessName ? fullName : email}</p>
          </div>
          <button onClick={signOut} disabled={signingOut} title="Sign out"
            style={{ background:'none', border:'none', cursor:'pointer', color:'#6B7280', padding:4, flexShrink:0, opacity:signingOut ? 0.5 : 1 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="dashboard-sidebar">
        <NavContent />
      </aside>

      {/* Hamburger — mobile only */}
      <button
        className="mobile-hamburger"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      {/* Mobile drawer */}
      <div className={`mobile-drawer-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        <div
          style={{ width:264, background:'#111827', height:'100%', display:'flex', flexDirection:'column', boxShadow:'4px 0 24px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 14px 4px' }}>
            <AmanaLogo size={30} />
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', padding:4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <NavContent onNav={() => setOpen(false)} />
        </div>
      </div>
    </>
  )
}