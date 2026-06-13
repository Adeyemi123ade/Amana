'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface TopbarProps { user: User }

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.user_metadata?.avatar_url || null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const fullName = user.user_metadata?.full_name || user.email || 'User'
  const firstName = fullName.split(' ')[0]
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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

  const handleRemoveAvatar = async () => {
    await supabase.auth.updateUser({ data: { avatar_url: null } })
    setAvatarUrl(null)
    setMenuOpen(false)
  }

  const handleSignOut = async () => {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="dashboard-topbar">
      {/* Greeting */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {greeting}, {firstName} 👋
        </p>
        <p className="topbar-subtitle" style={{ fontSize: 12, color: '#9CA3AF' }}>
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        {/* Bell */}
        <button style={{ width:36, height:36, borderRadius:8, background:'none', border:'1px solid #F3F4F6', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }} aria-label="Notifications">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span style={{ position:'absolute', top:6, right:6, width:7, height:7, background:'#EF4444', borderRadius:'50%', border:'1.5px solid white' }}/>
        </button>

        {/* New */}
        <Link href="/dashboard/invoices/create" style={{ height:36, padding:'0 14px', background:'#7C3AED', color:'white', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>New</span>
        </Link>

        {/* Avatar */}
        <div ref={menuRef} style={{ position:'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ width:36, height:36, borderRadius:'50%', background: avatarUrl ? 'transparent' : '#EDE9FE', border:'2px solid #E5E7EB', cursor:'pointer', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#7C3AED', padding:0, flexShrink:0 }}
            aria-label="Profile menu"
          >
            {uploading ? (
              <span style={{ width:14, height:14, border:'2px solid #7C3AED', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
            ) : avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            ) : initials}
          </button>

          {menuOpen && (
            <div style={{ position:'absolute', right:0, top:44, width:220, background:'white', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', border:'1px solid #F3F4F6', overflow:'hidden', zIndex:100 }}>
              <div style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6', background:'#F9FAFB' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{fullName}</p>
                <p style={{ fontSize:11, color:'#9CA3AF' }}>{user.email}</p>
              </div>
              <div style={{ padding:'6px 0' }}>
                <button onClick={() => fileRef.current?.click()} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <span style={{ fontSize:13, color:'#374151' }}>{avatarUrl ? 'Change profile image' : 'Upload profile image'}</span>
                </button>
                {avatarUrl && (
                  <button onClick={handleRemoveAvatar} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    <span style={{ fontSize:13, color:'#EF4444' }}>Remove image</span>
                  </button>
                )}
                <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', textDecoration:'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span style={{ fontSize:13, color:'#374151' }}>Profile settings</span>
                </Link>
              </div>
              <div style={{ borderTop:'1px solid #F3F4F6', padding:'6px 0' }}>
                <button onClick={handleSignOut} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer' }}>
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
