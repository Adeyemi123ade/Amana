'use client'
import { useState, useEffect } from 'react'
import { SUPER_ADMIN_EMAILS } from '@/lib/admin-auth'

export default function AdminTeamPage() {
  const [admins, setAdmins]         = useState<any[]>([])
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName]   = useState('')
  const [adminRole, setAdminRole]   = useState('')
  const [email, setEmail]           = useState('')
  const [name, setName]             = useState('')
  const [role, setRole]             = useState('ADMIN')
  const [preparing, setPreparing]   = useState(false)
  const [emailSent, setEmailSent]   = useState(false)
  const [inviteUrl, setInviteUrl]   = useState('')
  const [msg, setMsg]               = useState('')
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

  const prepareInvite = async () => {
    if (!email.trim()) { setMsg('Please enter the invitee email address'); return }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRx.test(email.trim())) { setMsg('Please enter a valid email address'); return }
    setPreparing(true); setMsg('')
    const res = await fetch('/api/admin/team', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
    })
    const data = await res.json()
    if (data.success) {
      setInviteUrl(data.inviteUrl)
      openEmail(data.inviteUrl)
    } else {
      setMsg('Error: ' + (data.error || 'Could not prepare invite'))
    }
    setPreparing(false)
  }

  const openEmail = (url: string) => {
    const to     = email.trim()
    const sender = adminName || adminEmail || 'Amana Admin'
    const subject = encodeURIComponent('You have been invited to join Amana Admin Dashboard')
    const body = encodeURIComponent(
      'Hello ' + (name.trim() || to) + ',\n\n' +
      sender + ' has invited you to join the Amana platform as an administrator.\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'INVITATION DETAILS\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Role:         ' + role + '\n' +
      'Invited by:   ' + sender + '\n' +
      'From:         ' + adminEmail + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'To accept this invitation, create your account using the link below.\n' +
      'Make sure to register with this exact email address: ' + to + '\n\n' +
      'Accept Invitation:\n' +
      url + '\n\n' +
      'Once registered, you will have access to the Amana Admin Dashboard\n' +
      'with the role of ' + role + '.\n\n' +
      'If you did not expect this invitation, please disregard this email.\n\n' +
      'Best regards,\n' +
      sender + '\n' +
      'Amana Admin'
    )
    window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body
    setEmailSent(true)
    load()
  }

  const resendEmail = () => {
    setEmailSent(false)
    setTimeout(() => openEmail(inviteUrl), 100)
  }

  const resetForm = () => {
    setEmail(''); setName(''); setRole('ADMIN')
    setEmailSent(false); setInviteUrl(''); setMsg('')
  }

  const remove = async (targetEmail: string) => {
    await fetch('/api/admin/team', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail }),
    })
    setConfirmRemove(null)
    load()
  }

  const inp: React.CSSProperties = {
    height: 42, padding: '0 14px', borderRadius: 9,
    border: '1px solid #E2E8F0', fontSize: 14, outline: 'none',
    background: 'white', color: '#1E293B', boxSizing: 'border-box', width: '100%',
  }
  const roleColor: Record<string, [string, string]> = {
    SUPER_ADMIN: ['#DC2626', '#FEF2F2'],
    ADMIN:       ['#0E1A6E', '#EEF2FF'],
    REVIEWER:    ['#D97706', '#FFFBEB'],
  }

  const isSuperAdmin = adminRole === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(adminEmail.toLowerCase())

  // A row is protected if its email is in the hardcoded super admin list
  const isProtected = (rowEmail: string) => SUPER_ADMIN_EMAILS.includes(rowEmail.toLowerCase())

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Admin Team</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Invite and manage who has access to the Amana Admin dashboard</p>
      </div>

      {/* Access denied for non-super-admins */}
      {adminRole && !isSuperAdmin && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>Access Restricted</p>
          <p style={{ fontSize: 13, color: '#B91C1C' }}>Only the Super Admin can invite new admins.</p>
        </div>
      )}

      {/* Invite card — super admin only */}
      {isSuperAdmin && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: 24, marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Invite New Admin</p>

          {emailSent ? (
            <>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>Invitation Email Opened</p>
                  <p style={{ fontSize: 12, color: '#15803D' }}>Check your email app and click Send to deliver the invitation to {email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={resendEmail}
                  style={{ flex: 1, height: 42, background: '#111827', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
                  </svg>
                  Resend Invitation
                </button>
                <button onClick={resetForm}
                  style={{ flex: 1, height: 42, background: 'none', border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 13, fontWeight: 500, color: '#64748B', cursor: 'pointer' }}>
                  Invite Another Admin
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Email Address *</label>
                  <input style={inp} placeholder="colleague@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Full Name (optional)</label>
                  <input style={inp} placeholder="Their full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Role</label>
                  <select style={inp} value={role} onChange={e => setRole(e.target.value)}>
                    <option value="ADMIN">Admin — full platform access</option>
                    <option value="REVIEWER">Reviewer — view only, can review KYC</option>
                    <option value="SUPER_ADMIN">Super Admin — can invite and remove admins</option>
                  </select>
                </div>
              </div>
              {msg && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{msg}</p>}
              <button onClick={prepareInvite} disabled={preparing}
                style={{ width: '100%', height: 48, background: preparing ? '#94A3B8' : '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
                </svg>
                {preparing ? 'Preparing...' : 'Open Email to Send Invitation'}
              </button>
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 8, textAlign: 'center' }}>
                Your email app will open with the invitation pre-filled. Review and click Send.
              </p>
            </>
          )}
        </div>
      )}

      {/* Admin list */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: .5 }}>
            {admins.length} Admin{admins.length !== 1 ? 's' : ''}
          </p>
        </div>
        {admins.map((a: any) => {
          const [c, b] = roleColor[a.role] || ['#64748B', '#F8FAFC']
          const protected_ = isProtected(a.email)
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0E1A6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {(a.display_name || a.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{a.display_name || 'Name not set'}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8' }}>{a.email}</p>
                  {a.invited_by && <p style={{ fontSize: 10, color: '#CBD5E1' }}>Invited by {a.invited_by}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: c, background: b, padding: '3px 10px', borderRadius: 20 }}>{a.role}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: a.active ? '#16A34A' : '#94A3B8', background: a.active ? '#F0FDF4' : '#F8FAFC', padding: '3px 8px', borderRadius: 20 }}>
                  {a.active ? 'Active' : 'Invited'}
                </span>
                {/* Protected super admins cannot be removed */}
                {!protected_ ? (
                  <button onClick={() => setConfirmRemove(a.email)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>
                    Remove
                  </button>
                ) : (
                  <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 7, background: '#F8FAFC', color: '#CBD5E1', fontWeight: 600, border: '1px solid #E2E8F0' }}>
                    Protected
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Remove confirmation modal */}
      {confirmRemove && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Remove Admin?</h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
              <strong>{confirmRemove}</strong> will lose all admin access immediately.
            </p>
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
