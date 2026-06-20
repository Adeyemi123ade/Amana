'use client'
import { useState, useEffect } from 'react'

export default function AdminProfilePage() {
  const [admin, setAdmin]       = useState<any>(null)
  const [email, setEmail]       = useState('')
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')

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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: name.trim(), phone: phone.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      setMsg('✓ Profile saved successfully')
    } else {
      setMsg('Error: ' + (data.error || 'Could not save. Please try again.'))
      console.error('Profile save failed:', data)
    }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white', color: '#1E293B' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }

  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Admin Profile</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Set up your admin identity on the Amana platform</p>
      </div>

      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Role badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <div style={{ width: 44, height: 44, background: '#0E1A6E', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
            {name ? name[0].toUpperCase() : email[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{name || 'Admin'}</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '2px 8px', borderRadius: 20 }}>{admin?.role || 'ADMIN'}</span>
          </div>
        </div>

        <div>
          <label style={lbl}>Full Name</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
        </div>

        <div>
          <label style={lbl}>Email Address <span style={{ color: '#94A3B8', fontWeight: 400 }}>(permanent — cannot be changed)</span></label>
          <input style={{ ...inp, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }} value={email} readOnly />
        </div>

        <div>
          <label style={lbl}>Phone Number</label>
          <input style={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
        </div>

        {msg && <p style={{ fontSize: 13, color: msg.startsWith('✓') ? '#16A34A' : '#DC2626' }}>{msg}</p>}

        <button onClick={save} disabled={saving}
          style={{ height: 44, background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1 }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
