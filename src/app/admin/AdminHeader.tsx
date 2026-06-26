'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminHeader({
  email,
  onMenuClick,
}: {
  email: string
  onMenuClick: () => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const [dark, setDark] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [openMsg, setOpenMsg] = useState<any>(null)
  const [adminName, setAdminName] = useState('')
  const [adminImg, setAdminImg] = useState('')
  const [uploading, setUploading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/profile').then(r => r.json()).then(d => {
      setAdminName(d.admin?.display_name || '')
      setAdminImg(d.admin?.logo_url || '')
    }).catch(() => {})
    loadNotifs()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (openMsg) setOpenMsg(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMsg])

  const loadNotifs = async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      const notifs = data.notifications || []
      setNotifications(notifs)
      setUnread(notifs.filter((n: any) => !n.read).length)
    } catch {}
  }

  const markRead = async (id: string) => {
    await fetch('/api/admin/notifications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'read' }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
    setOpenMsg(null)
  }

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const ext = file.name.split('.').pop()
      const path = `admin-avatars/${user?.id}.${ext}`
      const { error: upErr } = await supabase.storage.from('workspace-assets').upload(path, file, { upsert: true })
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('workspace-assets').getPublicUrl(path)
        await fetch('/api/admin/profile', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo_url: publicUrl }),
        })
        setAdminImg(publicUrl)
      }
    } finally { setUploading(false) }
  }

 const signOut = async () => {
  await supabase.auth.signOut()
  window.location.href = '/sign-in'
}

  const unreadNotifs = notifications.filter(n => !n.read)
  const readNotifs = notifications.filter(n => n.read)

  return (
    <>
      <style>{`
        .admin-logo-desktop { display: flex; }
        .admin-hamburger { display: none; }
        @media (max-width: 899px) {
          .admin-logo-desktop { display: none; }
          .admin-hamburger { display: flex; }
        }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: dark ? '#0F172A' : '#FFFFFF',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 56, flexShrink: 0,
      }}>

        {/* Left: hamburger (mobile only) OR logo (desktop only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Hamburger — mobile only */}
          <button onClick={onMenuClick}
            className="admin-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexDirection: 'column', gap: 4 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 20, height: 2, background: dark ? 'rgba(255,255,255,0.8)' : '#334155', borderRadius: 2, display: 'block' }}/>
            ))}
          </button>

          {/* Logo — desktop only */}
          <div className="admin-logo-desktop" style={{ alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#7C3AED', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: dark ? 'white' : '#0F172A', letterSpacing: '-0.3px' }}>Amana</span>
          </div>
        </div>

        {/* Right: dark mode + bell + profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Dark/Light toggle */}
          <button onClick={() => setDark(!dark)}
            style={{ background: dark ? '#1E293B' : '#F1F5F9', border: 'none', borderRadius: 20, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: dark ? 'rgba(255,255,255,0.7)' : '#64748B' }}>
            {dark ? '☀️' : '🌙'}
            <span style={{ fontSize: 11, fontWeight: 600 }}>{dark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Notification bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); loadNotifs() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={dark ? 'rgba(255,255,255,0.7)' : '#64748B'} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {unread > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: '#EF4444', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div style={{ position: 'absolute', right: 0, top: 42, width: 320, background: dark ? '#1E293B' : 'white', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, zIndex: 200, overflow: 'hidden', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: dark ? 'white' : '#0F172A' }}>Notifications</p>
                  {unread > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '2px 8px', borderRadius: 20 }}>{unread} unread</span>}
                </div>

                {openMsg && (
                  <div style={{ padding: 16, background: dark ? '#0F172A' : '#F8FAFC', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: dark ? 'white' : '#0F172A', marginBottom: 6 }}>{openMsg.title}</p>
                    <p style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.6)' : '#64748B', lineHeight: 1.6, marginBottom: 12 }}>{openMsg.message}</p>
                    <button onClick={() => markRead(openMsg.id)}
                      style={{ fontSize: 12, fontWeight: 700, color: 'white', background: '#7C3AED', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                      Mark as Read
                    </button>
                  </div>
                )}

                {notifications.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: dark ? 'rgba(255,255,255,0.4)' : '#94A3B8', fontSize: 13 }}>
                    No new messages
                  </div>
                ) : (
                  <>
                    {unreadNotifs.length > 0 && (
                      <div>
                        {unreadNotifs.map(n => (
                          <div key={n.id} onClick={() => setOpenMsg(n)}
                            style={{ padding: '12px 16px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F8FAFC'}`, cursor: 'pointer', background: dark ? 'rgba(124,58,237,0.08)' : '#F5F3FF' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: dark ? 'white' : '#1E293B' }}>{n.title}</p>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7C3AED', flexShrink: 0, marginTop: 4 }}/>
                            </div>
                            <p style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {readNotifs.length > 0 && (
                      <div>
                        <p style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.3)' : '#94A3B8', textTransform: 'uppercase', letterSpacing: .5 }}>Earlier</p>
                        {readNotifs.slice(0,5).map(n => (
                          <div key={n.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'}` }}>
                            <p style={{ fontSize: 12, fontWeight: 500, color: dark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }}>{n.title}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              {adminImg ? (
                <img src={adminImg} alt="profile" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #7C3AED' }}/>
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                  {(adminName || email)[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </button>

            {profileOpen && (
              <div style={{ position: 'absolute', right: 0, top: 42, width: 260, background: dark ? '#1E293B' : 'white', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '20px 16px', background: dark ? '#0F172A' : '#F8FAFC', textAlign: 'center', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}` }}>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
                    {adminImg ? (
                      <img src={adminImg} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #7C3AED' }}/>
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 24 }}>
                        {(adminName || email)[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                    <button onClick={() => fileRef.current?.click()}
                      style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: '#0E1A6E', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M15 3l6 6M9 21l-5-5 11-11 5 5L9 21z"/></svg>
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display: 'none' }}/>
                  {uploading && <p style={{ fontSize: 11, color: '#7C3AED', marginBottom: 4 }}>Uploading...</p>}
                  <p style={{ fontSize: 14, fontWeight: 700, color: dark ? 'white' : '#0F172A' }}>{adminName || 'Admin'}</p>
                  <p style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : '#64748B', marginTop: 2 }}>{email}</p>
                </div>
                <div style={{ padding: 12 }}>
                  <button onClick={() => { router.push('/admin/profile'); setProfileOpen(false) }}
                    style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: dark ? 'rgba(255,255,255,0.7)' : '#374151', cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>
                    ⚙️ Edit Profile
                  </button>
                  <button onClick={signOut}
                    style={{ display: 'block', width: '100%', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#DC2626', cursor: 'pointer', textAlign: 'left' }}>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}