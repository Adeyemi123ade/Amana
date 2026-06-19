'use client'
import { useState, useEffect } from 'react'

export default function AdminTeamPage() {
  const [admins, setAdmins]     = useState<any[]>([])
  const [email, setEmail]       = useState('')
  const [name, setName]         = useState('')
  const [role, setRole]         = useState('ADMIN')
  const [sending, setSending]   = useState(false)
  const [msg, setMsg]           = useState('')
  const [confirmRemove, setConfirmRemove] = useState<string|null>(null)

  const load = () => fetch('/api/admin/team').then(r=>r.json()).then(d=>setAdmins(d.admins||[]))
  useEffect(() => { load() }, [])

  const invite = async () => {
    if (!email.trim()) { setMsg('Please enter an email address'); return }
    setSending(true); setMsg('')
    const res = await fetch('/api/admin/team', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
    })
    const data = await res.json()
    if (data.success) { setMsg('✓ Invitation sent to ' + email); setEmail(''); setName(''); load() }
    else setMsg('Error: ' + data.error)
    setSending(false)
  }

  const remove = async (adminEmail: string) => {
    await fetch('/api/admin/team', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail }),
    })
    setConfirmRemove(null)
    load()
  }

  const inp: React.CSSProperties = { height: 42, padding: '0 14px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', background: 'white', color: '#1E293B', boxSizing: 'border-box' }
  const roleColor: Record<string,[string,string]> = { SUPER_ADMIN:['#DC2626','#FEF2F2'], ADMIN:['#0E1A6E','#EEF2FF'], REVIEWER:['#D97706','#FFFBEB'] }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Admin Team</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Manage who has admin access to the Amana platform</p>
      </div>

      {/* Invite form */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Invite New Admin</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 10, marginBottom: 12 }}>
          <input style={{ ...inp, width: '100%' }} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={{ ...inp, width: '100%' }} placeholder="Full name (optional)" value={name} onChange={e => setName(e.target.value)} />
          <select style={{ ...inp, width: '100%' }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="ADMIN">Admin</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        {msg && <p style={{ fontSize: 13, color: msg.startsWith('✓')?'#16A34A':'#DC2626', marginBottom: 10 }}>{msg}</p>}
        <button onClick={invite} disabled={sending}
          style={{ height: 42, padding: '0 24px', background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: sending?.7:1 }}>
          {sending ? 'Sending...' : 'Send Invitation'}
        </button>
      </div>

      {/* Admin list */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: .5 }}>
            {admins.length} Admin{admins.length !== 1 ? 's' : ''}
          </p>
        </div>
        {admins.map((a: any) => {
          const [c,b] = roleColor[a.role] || ['#64748B','#F8FAFC']
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0E1A6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {(a.display_name || a.email)[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{a.display_name || 'No name set'}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8' }}>{a.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: c, background: b, padding: '3px 10px', borderRadius: 20 }}>{a.role}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: a.active?'#16A34A':'#94A3B8', background: a.active?'#F0FDF4':'#F8FAFC', padding: '3px 8px', borderRadius: 20 }}>
                  {a.active ? 'Active' : 'Invited'}
                </span>
                {a.invited_by && (
                  <button onClick={() => setConfirmRemove(a.email)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Remove confirmation */}
      {confirmRemove && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Remove Admin?</h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}><strong>{confirmRemove}</strong> will lose all admin access immediately.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmRemove(null)}
                style={{ flex: 1, height: 42, background: 'none', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#64748B', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => remove(confirmRemove)}
                style={{ flex: 1, height: 42, background: '#DC2626', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
