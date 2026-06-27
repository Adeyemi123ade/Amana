'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminClientLayout({
  email,
  role,
  children,
}: {
  email: string
  role: string
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Desktop: sidebar always open
  // Mobile: sidebar toggled by hamburger
  const showSidebar = isMobile ? sidebarOpen : true

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--admin-bg, #F1F5F9)',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    }}>
      {/* Sidebar — fixed on desktop, overlay on mobile */}
      {showSidebar && (
        <>
          {isMobile && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }}
            />
          )}
          <div style={{
            width: isMobile ? 220 : 220,
            minWidth: isMobile ? 200 : 220,
            maxWidth: isMobile ? 220 : 220,
            position: isMobile ? 'fixed' : 'relative',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: isMobile ? 50 : 1,
            height: '100vh',
            flexShrink: 0,
          }}>
            <AdminSidebar
              email={email}
              role={role}
              onSelect={() => isMobile && setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main content area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Header — hamburger toggles sidebar on mobile, on desktop it can collapse sidebar */}
        <AdminHeader
          email={email}
          onMenuClick={() => setSidebarOpen(v => !v)}
        />
        <main style={{
          flex: 1,
          padding: 20,
          overflowY: 'auto',
          overflowX: 'hidden',
          minWidth: 0,
          background: 'var(--admin-main, #F1F5F9)',
          color: 'var(--admin-text, #0F172A)',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
