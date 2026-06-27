'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setUsers(d.users || [])
        setLoading(false)
      })
      .catch(() => { setError('Failed to load users'); setLoading(false) })
  }, [])

  if (loading) return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>User Management</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>Loading users...</p>
      </div>
      <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:40, textAlign:'center', color:'var(--admin-text-muted)' }}>
        Loading...
      </div>
    </div>
  )

  if (error) return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:16 }}>User Management</h1>
      <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:20, color:'#DC2626', fontSize:14 }}>Error: {error}</div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>User Management</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>{users.length} registered users on the platform</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
        {users.map((u:any) => {
          const name = u.user_metadata?.full_name || u.user_metadata?.name || ''
          const isActive = !!u.email_confirmed_at
          const joined = new Date(u.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })
          const initials = name ? name.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2) : (u.email?.[0] || 'U').toUpperCase()

          return (
            <Link key={u.id} href={'/admin/users/' + u.id} style={{ textDecoration:'none' }}>
              <div style={{ background:'var(--admin-card)', borderRadius:14, border:'1px solid var(--admin-card-border)', padding:'20px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:12 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:18, flexShrink:0 }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:'var(--admin-text)', marginBottom:4 }}>{name || 'No name set'}</p>
                  <p style={{ fontSize:12, color:'var(--admin-text-muted)', wordBreak:'break-all' }}>{u.email}</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, width:'100%' }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:20, color:isActive?'#16A34A':'#D97706', background:isActive?'#F0FDF4':'#FFFBEB' }}>
                    {isActive ? 'ACTIVE' : 'PENDING'}
                  </span>
                  <p style={{ fontSize:11, color:'var(--admin-text-muted)' }}>Joined {joined}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign:'center', padding:60, color:'var(--admin-text-muted)', fontSize:14 }}>No users found</div>
      )}
    </div>
  )
}
