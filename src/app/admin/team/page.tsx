'use client'
import { useState, useEffect } from 'react'

const SUPER_ADMIN_EMAILS = ['admin@kajolacooperative.com', 'admin@amana.app']

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminRole, setAdminRole] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmRemove, setConfirmRemove] = useState<string|null>(null)

  const load = () => {
    fetch('/api/admin/team').then(r => r.json()).then(d => setAdmins(d.admins || []))
    fetch('/api/admin/profile').then(r => r.json()).then(d => {
      setAdminEmail(d.email || '')
      setAdminName(d.admin?.display_name || '')
      setAdminRole(d.admin?.role || (SUPER_ADMIN_EMAILS.includes((d.email||'').toLowerCase()) ? 'SUPER_ADMIN' : 'ADMIN'))
    })
  }
  useEffect(() => { load() }, [])

  const sendInvite = async () => {
    if (!email.trim()) { setMsg('Please enter the invitee email address'); return }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRx.test(email.trim())) { setMsg('Please enter a valid email address'); return }
    setSending(true); setMsg('')
    const res = await fetch('/api/admin/team', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
    })
    const data = await res.json()
    if (data.success) {
      setSent(true)
      load()
    } else {
      setMsg('Error: ' + (data.error || 'Could not send invite'))
    }
    setSending(false)
  }

  const remove = async (targetEmail: string) => {
    await fetch('/api/admin/team', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail }),
    })
    setConfirmRemove(null)
    load()
  }

  const resetForm = () => {
    setEmail(''); setName(''); setRole('ADMIN'); setSent(false); setMsg('')
  }

  const inp: React.CSSProperties = { height:42, padding:'0 14px', borderRadius:9, border:'1px solid var(--admin-card-border)', fontSize:14, outline:'none', background:'var(--admin-bg)', color:'var(--admin-text)', boxSizing:'border-box', width:'100%' }
  const lbl: React.CSSProperties = { fontSize:12, fontWeight:600, color:'var(--admin-text-secondary)', display:'block', marginBottom:5 }
  const roleColor: Record<string,[string,string]> = {
    SUPER_ADMIN:['#DC2626','#FEF2F2'], ADMIN:['#0E1A6E','#EEF2FF'], REVIEWER:['#D97706','#FFFBEB'],
  }
  const isSuperAdmin = adminRole === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(adminEmail.toLowerCase())

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Admin Team</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>Invite and manage who has access to the Amana Admin dashboard</p>
      </div>

      {/* Access restricted for non-super-admins */}
      {!isSuperAdmin && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#DC2626', marginBottom:4 }}>Access Restricted</p>
          <p style={{ fontSize:13, color:'#B91C1C' }}>Only the Super Admin can invite new admins.</p>
        </div>
      )}

      {/* Invite card — super admin only */}
      {isSuperAdmin && (
        <div style={{ background:'var(--admin-card)', borderRadius:14, border:'1px solid var(--admin-card-border)', padding:24, marginBottom:24 }}>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:16 }}>Invite New Admin</p>

          {sent ? (
            <div>
              <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, padding:'14px 18px', marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#16A34A' }}>Invitation Sent!</p>
                  <p style={{ fontSize:12, color:'#15803D' }}>An email with a registration link was sent to {email}</p>
                </div>
              </div>
              <button onClick={resetForm}
                style={{ width:'100%', height:44, background:'var(--admin-bg)', border:'1px solid var(--admin-card-border)', borderRadius:10, fontSize:13, fontWeight:500, color:'var(--admin-text)', cursor:'pointer' }}>
                Invite Another Admin
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={lbl}>Email Address *</label>
                <input style={inp} placeholder="colleague@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Full Name (optional)</label>
                <input style={inp} placeholder="Their full name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Role</label>
                <select style={inp} value={role} onChange={e => setRole(e.target.value)}>
                  <option value="ADMIN">Admin — full platform access</option>
                  <option value="REVIEWER">Reviewer — view only, can review KYC</option>
                  <option value="SUPER_ADMIN">Super Admin — can invite and remove admins</option>
                </select>
              </div>
              {msg && <p style={{ fontSize:13, color:'#DC2626' }}>{msg}</p>}
              <button onClick={sendInvite} disabled={sending}
                style={{ width:'100%', height:48, background:sending?'#94A3B8':'#0E1A6E', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {sending ? 'Sending...' : 'Send Invitation Email'}
              </button>
              <p style={{ fontSize:11, color:'var(--admin-text-muted)', textAlign:'center' }}>
                The invitee will receive an email with a link to create their admin account.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Admin list */}
      <div style={{ background:'var(--admin-card)', borderRadius:14, border:'1px solid var(--admin-card-border)', overflow:'hidden' }}>
        <div style={{ padding:'12px 20px', background:'var(--admin-bg)', borderBottom:'2px solid var(--admin-card-border)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--admin-text-muted)', textTransform:'uppercase', letterSpacing:.5 }}>
            {admins.length} Admin{admins.length !== 1 ? 's' : ''}
          </p>
        </div>
        {admins.map((a:any) => {
          const [c,b] = roleColor[a.role] || ['#64748B','#F8FAFC']
          return (
            <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--admin-card-border)', flexWrap:'wrap', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'#0E1A6E', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:14, flexShrink:0 }}>
                  {(a.display_name || a.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--admin-text)' }}>{a.display_name || 'Name not set'}</p>
                  <p style={{ fontSize:11, color:'var(--admin-text-muted)' }}>{a.email}</p>
                  {a.invited_by && <p style={{ fontSize:10, color:'var(--admin-text-faint)' }}>Invited by {a.invited_by}</p>}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <span style={{ fontSize:10, fontWeight:700, color:c, background:b, padding:'3px 10px', borderRadius:20 }}>{a.role}</span>
                <span style={{ fontSize:10, fontWeight:700, color:a.active?'#16A34A':'#94A3B8', background:a.active?'#F0FDF4':'var(--admin-bg)', padding:'3px 8px', borderRadius:20 }}>
                  {a.active ? 'Active' : 'Invited'}
                </span>
                {isSuperAdmin && !SUPER_ADMIN_EMAILS.includes(a.email?.toLowerCase()) && (
                  <button onClick={() => setConfirmRemove(a.email)}
                    style={{ fontSize:11, padding:'4px 10px', borderRadius:7, border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', cursor:'pointer', fontWeight:600 }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirm remove modal */}
      {confirmRemove && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div style={{ background:'var(--admin-card)', borderRadius:16, padding:28, maxWidth:380, width:'100%', textAlign:'center', border:'1px solid var(--admin-card-border)' }}>
            <p style={{ fontSize:16, fontWeight:700, color:'var(--admin-text)', marginBottom:8 }}>Remove Admin?</p>
            <p style={{ fontSize:13, color:'var(--admin-text-muted)', marginBottom:24 }}>
              <strong style={{ color:'var(--admin-text)' }}>{confirmRemove}</strong> will lose all admin access immediately.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmRemove(null)}
                style={{ flex:1, height:42, background:'none', border:'1px solid var(--admin-card-border)', borderRadius:10, fontSize:14, color:'var(--admin-text-muted)', cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={() => remove(confirmRemove)}
                style={{ flex:1, height:42, background:'#DC2626', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
