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
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/profile').then(r => r.json()).then(d => {
      setAdminName(d.admin?.display_name || '')
      const url = d.admin?.logo_url
      setAdminImg(url ? `${url}?t=${Date.now()}` : '')
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
    setUploadSuccess(false)
    setUploadError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('Not authenticated')
      const ext = file.name.split('.').pop()
      // Use 'avatars' bucket — same as business dashboard, confirmed working and public
      const path = `admin-avatars/${user.id}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (upErr) throw new Error(upErr.message)
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)
      const saveRes = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: publicUrl }),
      })
      const saveData = await saveRes.json()
      if (!saveData.success) throw new Error(saveData.error || 'Profile save failed')
      setAdminImg(`${publicUrl}?t=${Date.now()}`)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed')
      setTimeout(() => setUploadError(''), 4000)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const signOut = async () => {
    setProfileOpen(false)
    await supabase.auth.signOut()
    window.location.replace('/sign-in')
  }

  const bg = dark ? 'var(--admin-header)' : '#FFFFFF'
  const borderC = dark ? 'var(--admin-header-border)' : '#E2E8F0'
  const textC = dark ? 'var(--admin-text)' : '#0F172A'
  const mutedC = dark ? 'var(--admin-text-muted)' : '#64748B'
  const cardBg = dark ? 'var(--admin-card)' : '#FFFFFF'
  const cardBorder = dark ? 'var(--admin-card-border)' : '#E2E8F0'

  const unreadNotifs = notifications.filter(n => !n.read)
  const readNotifs = notifications.filter(n => n.read)

  return (
    <>
      <style>{`
        /* Hamburger always visible — sidebar shows the logo */
        .admin-hamburger { display: flex; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: bg,
        borderBottom: `1px solid ${borderC}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 56, flexShrink: 0,
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onMenuClick} className="admin-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexDirection: 'column', gap: 4 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 20, height: 2, background: mutedC, borderRadius: 2, display: 'block' }}/>
            ))}
          </button>


        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Dark mode toggle — same style as business topbar */}
          <button onClick={() => setDark(!dark)}
            style={{ width: 36, height: 36, borderRadius: 8, background: 'none', border: `1px solid ${borderC}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {dark ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={mutedC} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={mutedC} strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); loadNotifs() }}
              style={{ width: 36, height: 36, borderRadius: 8, background: 'none', border: `1px solid ${borderC}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={mutedC} strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {unread > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, background: '#EF4444', borderRadius: 20, border: `2px solid ${bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', padding: '0 3px' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div style={{ position: 'absolute', right: 0, top: 44, width: 320, background: cardBg, borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: `1px solid ${cardBorder}`, zIndex: 200, overflow: 'hidden', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: textC }}>Notifications</p>
                  {unread > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '2px 8px', borderRadius: 20 }}>{unread} unread</span>}
                </div>
                {openMsg && (
                  <div style={{ padding: 16, background: dark ? 'rgba(0,0,0,0.2)' : '#F8FAFC', borderBottom: `1px solid ${cardBorder}` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: textC, marginBottom: 6 }}>{openMsg.title}</p>
                    <p style={{ fontSize: 12, color: mutedC, lineHeight: 1.6, marginBottom: 12 }}>{openMsg.message}</p>
                    <button onClick={() => markRead(openMsg.id)}
                      style={{ fontSize: 12, fontWeight: 700, color: 'white', background: '#7C3AED', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                      Mark as Read
                    </button>
                  </div>
                )}
                {notifications.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: mutedC, fontSize: 13 }}>No new messages</div>
                ) : (
                  <>
                    {unreadNotifs.length > 0 && unreadNotifs.map(n => (
                      <div key={n.id} onClick={() => setOpenMsg(n)}
                        style={{ padding: '12px 16px', borderBottom: `1px solid ${cardBorder}`, cursor: 'pointer', background: dark ? 'rgba(124,58,237,0.08)' : '#F5F3FF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: textC }}>{n.title}</p>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7C3AED', flexShrink: 0, marginTop: 4 }}/>
                        </div>
                        <p style={{ fontSize: 12, color: mutedC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                      </div>
                    ))}
                    {readNotifs.length > 0 && (
                      <>
                        <p style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: mutedC, textTransform: 'uppercase', letterSpacing: .5 }}>Earlier</p>
                        {readNotifs.slice(0,5).map(n => (
                          <div key={n.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${cardBorder}` }}>
                            <p style={{ fontSize: 12, fontWeight: 500, color: mutedC }}>{n.title}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: adminImg ? 'transparent' : '#7C3AED', border: '2px solid #7C3AED', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
              {adminImg ? (
                <img src={adminImg} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              ) : (
                <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                  {(adminName || email)[0]?.toUpperCase() || 'A'}
                </span>
              )}
            </button>

            {profileOpen && (
              <div style={{ position: 'absolute', right: 0, top: 44, width: 260, background: cardBg, borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', border: `1px solid ${cardBorder}`, zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '20px 16px 16px', background: dark ? 'rgba(0,0,0,0.2)' : '#F8FAFC', textAlign: 'center', borderBottom: `1px solid ${cardBorder}` }}>
                  {adminImg ? (
                    <img src={adminImg} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #7C3AED', display: 'block', margin: '0 auto 10px' }}/>
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 24, margin: '0 auto 10px' }}>
                      {(adminName || email)[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                  <p style={{ fontSize: 14, fontWeight: 700, color: textC, marginBottom: 2 }}>{adminName || 'Admin'}</p>
                  <p style={{ fontSize: 12, color: mutedC, marginBottom: 12 }}>{email}</p>

                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    style={{ width: '100%', padding: '8px 0', background: uploadSuccess ? '#22C55E' : uploadError ? '#EF4444' : '#7C3AED', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: uploading ? 0.7 : 1 }}>
                    {uploading ? (
                      <><span style={{ width: 12, height: 12, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}/>Uploading...</>
                    ) : uploadSuccess ? '✓ Photo saved!' : uploadError ? '✗ ' + uploadError : (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Change Photo</>
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} style={{ display: 'none' }}/>
                </div>

                <div style={{ padding: 12 }}>
                  <button onClick={() => { router.push('/admin/profile'); setProfileOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: textC, cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={mutedC} strokeWidth="1.8" strokeLinecap="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
                    Edit Profile
                  </button>
                  <button onClick={signOut}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#DC2626', cursor: 'pointer', textAlign: 'left' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
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
