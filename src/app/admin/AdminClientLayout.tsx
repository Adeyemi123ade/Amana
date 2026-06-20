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

  // On desktop, sidebar always visible. On mobile, controlled by hamburger.
  const showSidebar = isMobile ? sidebarOpen : true

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", flexDirection: 'column' }}>
      {/* Header - always on top */}
      <AdminHeader email={email} onMenuClick={() => setSidebarOpen(v => !v)} />

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Overlay on mobile */}
            {isMobile && (
              <div onClick={() => setSidebarOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, top: 56 }}/>
            )}
            <div style={{
              width: isMobile ? '40vw' : 220,
              minWidth: isMobile ? 160 : 220,
              maxWidth: isMobile ? '40vw' : 220,
              position: isMobile ? 'fixed' : 'relative',
              top: isMobile ? 56 : 0,
              left: 0,
              bottom: 0,
              zIndex: isMobile ? 50 : 1,
              height: isMobile ? 'calc(100vh - 56px)' : 'auto',
              overflowY: 'auto',
            }}>
              <AdminSidebar
                email={email}
                role={role}
                onSelect={() => isMobile && setSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main content */}
        <main style={{ flex: 1, padding: 20, overflowY: 'auto', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
