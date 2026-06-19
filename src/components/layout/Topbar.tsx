'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/theme/ThemeProvider'

interface TopbarProps { user: User }

const supabase = createClient()

// Quick dark/light toggle — cycles light → dark → light
function ThemeToggle() {
  const { themeId, setTheme } = useTheme()
  const isDark = themeId === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      style={{ width:36, height:36, borderRadius:8, background:'none', border:'1px solid var(--border-light)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
    >
      {isDark ? (
        // Sun icon — shown in dark mode to switch to light
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        // Moon icon — shown in light mode to switch to dark
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  )
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.user_metadata?.avatar_url || null)
  const [displayName, setDisplayName] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [wsId, setWsId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      const name = u?.user_metadata?.business_name || u?.user_metadata?.full_name || u?.email || 'there'
      setDisplayName(name.split(' ')[0])
      setAvatarUrl(u?.user_metadata?.avatar_url || null)
      if (u) {
        const { data: ws } = await supabase.from('workspaces').select('id').eq('created_by', u.id).maybeSingle()
        if (ws) {
          setWsId(ws.id)
          const { data: notifs } = await supabase
            .from('notifications').select('*').eq('workspace_id', ws.id)
            .eq('read', false)
            .order('created_at', { ascending: false }).limit(20)
          setNotifications(notifs || [])

          // ── REAL-TIME SUBSCRIPTION ────────────────────────
          // New notifications push instantly without page refresh
          const channel = supabase
            .channel(`notifications:${ws.id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `workspace_id=eq.${ws.id}`,
              },
              (payload) => {
                // Prepend new notification to top of list
                setNotifications(prev => [payload.new as any, ...prev.slice(0, 19)])
              }
            )
            .subscribe()

          // Cleanup subscription on unmount
          return () => { supabase.removeChannel(channel) }
        }
      }
    }
    load()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    // Remove from list when explicitly marked read
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // When panel opens — mark all as "seen" (reduces counter) but keeps them visible
  // until user explicitly clicks Mark as Read
  const markAllSeen = async () => {
    if (!wsId) return
    const unseenIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unseenIds.length === 0) return
    // Update in DB
    await supabase.from('notifications').update({ read: true }).in('id', unseenIds)
    // Mark as read in state but keep in list (they stay visible until dismissed)
    setNotifications(prev => prev.map(n => unseenIds.includes(n.id) ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    if (!wsId) return
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
    setNotifications([])
  }

  const fullName = user.user_metadata?.full_name || user.email || 'User'
  const businessName = user.user_metadata?.business_name || ''
  const greetingName = businessName || displayName || fullName.split(' ')[0]
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      await supabase.auth.updateUser({ data: { avatar_url: url } })
      setAvatarUrl(url)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      setMenuOpen(false)
    }
  }

  const handleSignOut = async () => {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <header className="dashboard-topbar">
      {/* Greeting */}
      <div style={{ minWidth:0, flex:1 }}>
        <p style={{ fontSize:15, fontWeight:600, color:'var(--text)', whiteSpace:'normal', lineHeight:1.3, wordBreak:'break-word' }}>
          {greeting}, {greetingName} 👋
        </p>
        <p className="topbar-subtitle" style={{ fontSize:12, color:'var(--text-muted)' }}>
          Here is what is happening with your business today.
        </p>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>

        {/* Dark/Light mode quick toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position:'relative' }}>
          <button onClick={() => { const opening = !notifOpen; setNotifOpen(opening); setMenuOpen(false); if (opening) markAllSeen() }}
            style={{ width:36, height:36, borderRadius:8, background:'none', border:'1px solid var(--border-light)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}
            aria-label="Notifications">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {unread > 0 && (
              <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, background:'#EF4444', borderRadius:20, border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'white', padding:'0 3px' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <div style={{ position:'absolute', right:0, top:44, width:320, background:'var(--card)', borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,0.14)', border:'1px solid var(--border-light)', overflow:'hidden', zIndex:100 }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>
                  Notifications {unread > 0 && <span style={{ fontSize:11, fontWeight:600, color:'#EF4444', background:'#FEF2F2', padding:'1px 6px', borderRadius:10, marginLeft:4 }}>{unread} new</span>}
                </p>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ fontSize:11, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight:340, overflowY:'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding:'32px 16px', textAlign:'center' }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
                    <p style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:4 }}>You have no new notifications</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)' }}>Notifications will appear here when something happens</p>
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id}
                    style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background:'transparent', display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{n.title}</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.4, marginBottom:6 }}>{n.description}</p>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <p style={{ fontSize:10, color:'var(--text-muted)' }}>{timeAgo(n.created_at)}</p>
                        <button onClick={() => markRead(n.id)}
                          style={{ fontSize:11, fontWeight:600, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:'2px 0' }}>
                          Mark as read
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar menu */}
        <div ref={menuRef} style={{ position:'relative' }}>
          <button onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false) }}
            style={{ width:36, height:36, borderRadius:'50%', background: avatarUrl ? 'transparent' : 'var(--accent-light)', border:'2px solid var(--border-light)', cursor:'pointer', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--accent)', padding:0, flexShrink:0 }}
            aria-label="Profile menu">
            {uploading ? (
              <span style={{ width:14, height:14, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
            ) : avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            ) : initials}
          </button>

          {menuOpen && (
            <div style={{ position:'absolute', right:0, top:44, width:220, background:'var(--card)', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', border:'1px solid var(--border-light)', overflow:'hidden', zIndex:100 }}>
              <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{businessName || fullName}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>{user.email}</p>
              </div>
              <div style={{ padding:'6px 0' }}>
                <button onClick={() => fileRef.current?.click()}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Upload profile image</span>
                </button>
                <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', textDecoration:'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Profile settings</span>
                </Link>
              </div>
              <div style={{ borderTop:'1px solid var(--border)', padding:'6px 0' }}>
                <button onClick={handleSignOut}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  <span style={{ fontSize:13, color:'#EF4444', fontWeight:500 }}>Sign out</span>
                </button>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handleAvatarUpload} />
        </div>
      </div>
    </header>
  )
}
