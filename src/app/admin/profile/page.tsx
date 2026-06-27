'use client'
import { useState, useEffect } from 'react'

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/profile').then(r => r.json()).then(d => {
      setAdmin(d.admin)
      setEmail(d.email || '')
      setName(d.admin?.display_name || '')
      setPhone(d.admin?.phone || '')
    })
  }, [])

  const save = async () => {
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/profile', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ display_name: name.trim(), phone: phone.trim() }),
    })
    const data = await res.json()
    setMsg(data.success ? '\u2713 Profile saved successfully' : 'Error: ' + (data.error || 'Could not save'))
    setSaving(false)
  }

  const inp: React.CSSProperties = { width:'100%', height:44, padding:'0 14px', borderRadius:9, border:'1px solid var(--admin-card-border)', fontSize:14, outline:'none', boxSizing:'border-box', background:'var(--admin-bg)', color:'var(--admin-text)' }
  const lbl: React.CSSProperties = { display:'block', fontSize:12, fontWeight:600, color:'var(--admin-text-secondary)', marginBottom:6 }

  return (
    <div style={{ maxWidth:540 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>My Profile</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>Manage your admin identity on the Amana platform</p>
      </div>

      <div style={{ background:'var(--admin-card)', borderRadius:14, border:'1px solid var(--admin-card-border)', padding:28, display:'flex', flexDirection:'column', gap:18 }}>
        {/* Avatar + role */}
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'var(--admin-bg)', borderRadius:10, border:'1px solid var(--admin-card-border)' }}>
          <div style={{ width:52, height:52, background:'#0E1A6E', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:20, flexShrink:0 }}>
            {name ? name[0].toUpperCase() : email[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <p style={{ fontSize:15, fontWeight:700, color:'var(--admin-text)', marginBottom:4 }}>{name || 'Admin'}</p>
            <span style={{ fontSize:11, fontWeight:700, color:'#7C3AED', background:'#EDE9FE', padding:'3px 10px', borderRadius:20 }}>{admin?.role || 'ADMIN'}</span>
          </div>
        </div>

        <div>
          <label style={lbl}>Full Name</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
        </div>

        <div>
          <label style={lbl}>Email Address <span style={{ color:'var(--admin-text-muted)', fontWeight:400 }}>(cannot be changed)</span></label>
          <input style={{ ...inp, opacity:0.6, cursor:'not-allowed' }} value={email} readOnly />
        </div>

        <div>
          <label style={lbl}>Phone Number</label>
          <input style={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
        </div>

        {msg && <p style={{ fontSize:13, color:msg.startsWith('\u2713') ? '#16A34A' : '#DC2626' }}>{msg}</p>}

        <button onClick={save} disabled={saving}
          style={{ height:46, background:'#0E1A6E', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', opacity:saving?0.7:1 }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
