'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',            label: 'Dashboard',       icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { href: '/admin/businesses', label: 'Businesses',      icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { href: '/admin/kyc',        label: 'KYC Review',      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { href: '/admin/invoices',   label: 'Billing & Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { href: '/admin/support',    label: 'Support',         icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/admin/reports',    label: 'Reports',         icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/admin/logs',       label: 'Activity Log',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/admin/team',       label: 'Admin Team',      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/admin/profile',    label: 'My Profile',      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

const SUPER_ADMIN_EMAILS = ['admin@kajolacooperative.com', 'admin@amana.app']

export default function AdminSidebar({
  email,
  role,
  onSelect,
}: {
  email: string
  role?: string
  onSelect?: () => void
}) {
  const path = usePathname()
  const isSuperAdmin = role === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(email.toLowerCase())

  return (
    <aside style={{ width: '100%', background: '#0E1A6E', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar logo — always visible (header shows only hamburger) */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#7C3AED', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white"/>
            </svg>
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', lineHeight: 1.2 }}>Amana</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Admin</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.filter(item => item.href !== '/admin/team' || isSuperAdmin).map(item => {
          const active = path === item.href || (item.href !== '/admin' && path.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={onSelect}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 2, textDecoration: 'none', background: active ? 'rgba(124,58,237,0.3)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: active ? 700 : 400, transition: 'all .15s', borderLeft: active ? '3px solid #7C3AED' : '3px solid transparent' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d={item.icon}/>
              </svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Admin email footer — larger, more readable, not cut off */}
      <div style={{ padding: '14px 16px 18px', borderTop: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(124,58,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
              {(email[0] || 'A').toUpperCase()}
            </span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
              {email}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>Platform Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
