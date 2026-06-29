'use client'
import { useState, useEffect } from 'react'

const SUPER_ADMIN_EMAILS = ['admin@kajolacooperative.com', 'admin@amana.app']

export default function AdminTeamPage() {
  const [admins, setAdmins]         = useState<any[]>([])
  const [invites, setInvites]       = useState<any[]>([])
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName]   = useState('')
  const [adminRole, setAdminRole]   = useState('')
  const [email, setEmail]           = useState('')
  const [name, setName]             = useState('')
  const [role, setRole]             = useState('ADMIN')
  const [preparing, setPreparing]   = useState(false)
  const [emailOpened, setEmailOpened] = useState(false)
  const [inviteUrl, setInviteUrl]   = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [msg, setMsg]               = useState('')
  const [confirmRemove, setConfirmRemove] = useState<{email:string,type:'admin'|'invite'}|null>(null)

  const load = () => {
    fetch('/api/admin/team').then(r => r.json()).then(d => {
      setAdmins(d.admins || [])
      setInvites(d.invites || [])
    })
    fetch('/api/admin/profile').then(r => r.json()).then(d => {
      setAdminEmail(d.email || '')
      setAdminName(d.admin?.display_name || '')
      setAdminRole(d.admin?.role || (SUPER_ADMIN_EMAILS.includes((d.email||'').toLowerCase()) ? 'SUPER_ADMIN' : 'ADMIN'))
    })
  }

  useEffect(() => { load() }, [])

  const openEmailInvite = async () => {
    if (!email.trim()) { setMsg('Please enter the email address'); return }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRx.test(email.trim())) { setMsg('Please enter a valid email address'); return }
    setPreparing(true); setMsg('')

    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
    })
    const data = await res.json()

    if (!data.success) {
      setMsg('Error: ' + (data.error || 'Could not prepare invitation'))
      setPreparing(false)
      return
    }

    const url = data.inviteUrl
    const sender = adminName || adminEmail
    const recipientName = name.trim() || email.trim()

    const subject = encodeURIComponent("You've been invited to join Amana Admin Dashboard")
    const body = encodeURIComponent(
      'Hello ' + recipientName + ',\n\n' +
      sender + ' has invited you to join the Amana Admin Dashboard as ' + role + '.\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'INVITATION DETAILS\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Role:         ' + role + '\n' +
      'Invited by:   ' + sender + '\n' +
      'Your email:   ' + email.trim() + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Use the link below to create your admin account and set your password:\n\n' +
      url + '\n\n' +
      'Once you click the link, you will be asked to enter your name and set a password.\n' +
      'After that, you can sign in at https://amana-two.vercel.app/sign-in\n\n' +
      'If you did not expect this invitation, you can safely ignore this email.\n\n' +
      'Best regards,\n' +
      sender + '\n' +
      'Amana Admin'
    )

    window.location.href = 'mailto:' + email.trim() + '?subject=' + subject + '&body=' + body

    setInviteUrl(url)
    setInviteEmail(email.trim())
    setEmailOpened(true)
    load()
    setPreparing(false)
  }

  const resendEmail = () => {
    setEmailOpened(false)
    setTimeout(openEmailInvite, 100)
  }

  const resetForm = () => {
    setEmail(''); setName(''); setRole('ADMIN')
    setEmailOpened(false); setInviteUrl(''); setInviteEmail(''); setMsg('')
  }

  const remove = async () => {
    if (!confirmRemove) return
    await fetch('/api/admin/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: confirmRemove.email, type: confirmRemove.type }),
    })
    setConfirmRemove(null)
    load()
  }

  const inp: React.CSSProperties = {
    height: 42, padding: '0 14px', borderRadius: 9,
    border: '1px solid var(--admin-card-border)', fontSize: 14, outline: 'none',
    background: 'var(--admin-bg)', color: 'var(--admin-text)',
    boxSizing: 'border-box', width: '100%',
  }
  const lbl: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--admin-text-secondary)',
    display: 'block', marginBottom: 5,
  }
  const roleColor: Record<string, [string, string]> = {
    SUPER_ADMIN: ['#DC2626', '#FEF2F2'],
    ADMIN:       ['#0E1A6E', '#EEF2FF'],
    REVIEWER:    ['#D97706', '#FFFBEB'],
  }
  const isSuperAdmin = adminRole === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(adminEmail.toLowerCase())

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>Admin Team</h1>
        <p style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>
          Invite and manage who has access to the Amana Admin dashboard
        </p>
      </div>

      {!isSuperAdmin && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>Access Restricted</p>
          <p style={{ fontSize: 13, color: '#B91C1C' }}>Only the Super Admin can invite new admins.</p>
        </div>
      )}

      {isSuperAdmin && (
        <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-card-border)', padding: 24, marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 16 }}>Invite New Admin</p>

          {emailOpened ? (
            <>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>Email App Opened</p>
                  <p style={{ fontSize: 13, color: '#15803D', lineHeight: 1.6 }}>
                    Your email app has opened with the invitation pre-filled for{' '}
                    <strong>{inviteEmail}</strong>. Review the email and click <strong>Send</strong>.
                    The invite will appear below as <em>Pending</em> until they accept.
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-card-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  Invitation Link (share manually if needed)
                </p>
                <p style={{ fontSize: 12, color: 'var(--admin-accent, #7C3AED)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {inviteUrl}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={resendEmail}
                  style={{ flex: 1, height: 44, background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
                  </svg>
                  Resend
                </button>
                <button onClick={resetForm}
                  style={{ flex: 1, height: 44, background: 'none', border: '1px solid var(--admin-card-border)', borderRadius: 10, fontSize: 13, color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
                  Invite Another
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              {msg && (
                <p style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>
                  {msg}
                </p>
              )}
              <button onClick={openEmailInvite} disabled={preparing}
                style={{ width: '100%', height: 48, background: preparing ? '#94A3B8' : '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: preparing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
                </svg>
                {preparing ? 'Preparing...' : 'Open Email to Send Invitation'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', textAlign: 'center' }}>
                Your email app will open with the invitation pre-filled. Review and click Send.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Active Admins */}
      <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-card-border)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '12px 20px', background: 'var(--admin-bg)', borderBottom: '2px solid var(--admin-card-border)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Active Admins ({admins.length})
          </p>
        </div>
        {admins.length === 0 && (
          <p style={{ padding: '20px', fontSize: 13, color: 'var(--admin-text-muted)' }}>No active admins found.</p>
        )}
        {admins.map((a: any) => {
          const [c, b] = roleColor[a.role] || ['#64748B', '#F8FAFC']
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--admin-card-border)', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0E1A6E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {(a.display_name || a.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{a.display_name || 'Name not set'}</p>
                  <p style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{a.email}</p>
                  {a.invited_by && (
                    <p style={{ fontSize: 10, color: 'var(--admin-text-faint)' }}>Invited by {a.invited_by}</p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: c, background: b, padding: '3px 10px', borderRadius: 20 }}>{a.role}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '3px 8px', borderRadius: 20 }}>Active</span>
                {isSuperAdmin && !SUPER_ADMIN_EMAILS.includes(a.email?.toLowerCase()) && (
                  <button onClick={() => setConfirmRemove({ email: a.email, type: 'admin' })}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-card-border)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: 'var(--admin-bg)', borderBottom: '2px solid var(--admin-card-border)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Pending Invites ({invites.length})
            </p>
          </div>
          {invites.map((inv: any) => {
            const [c, b] = roleColor[inv.role] || ['#64748B', '#F8FAFC']
            const expired = new Date(inv.expires_at) < new Date()
            return (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--admin-card-border)', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {(inv.display_name || inv.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{inv.display_name || 'Name not set'}</p>
                    <p style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{inv.email}</p>
                    {inv.invited_by && (
                      <p style={{ fontSize: 10, color: 'var(--admin-text-faint)' }}>Invited by {inv.invited_by}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c, background: b, padding: '3px 10px', borderRadius: 20 }}>{inv.role}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: expired ? '#DC2626' : '#D97706', background: expired ? '#FEF2F2' : '#FFFBEB', padding: '3px 8px', borderRadius: 20 }}>
                    {expired ? 'Expired' : 'Pending'}
                  </span>
                  {isSuperAdmin && (
                    <button onClick={() => setConfirmRemove({ email: inv.email, type: 'invite' })}
                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmRemove && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center', border: '1px solid var(--admin-card-border)' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
              {confirmRemove.type === 'invite' ? 'Cancel Invitation?' : 'Remove Admin?'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginBottom: 24 }}>
              <strong style={{ color: 'var(--admin-text)' }}>{confirmRemove.email}</strong>{' '}
              {confirmRemove.type === 'invite'
                ? 'will no longer be able to use this invitation link.'
                : 'will lose all admin access immediately.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmRemove(null)}
                style={{ flex: 1, height: 42, background: 'none', border: '1px solid var(--admin-card-border)', borderRadius: 10, fontSize: 14, color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={remove}
                style={{ flex: 1, height: 42, background: '#DC2626', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {confirmRemove.type === 'invite' ? 'Yes, Cancel Invite' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
