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
  const [step, setStep] = useState<'form'|'preview'|'sent'>('form')
  const [previewUrl, setPreviewUrl] = useState('')
  const [sending, setSending] = useState(false)
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

  const preparePreview = () => {
    if (!email.trim()) { setMsg('Please enter the email address'); return }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRx.test(email.trim())) { setMsg('Please enter a valid email address'); return }
    setMsg('')
    const appUrl = 'https://amana-two.vercel.app'
    setPreviewUrl(`${appUrl}/admin-invite/[TOKEN-WILL-BE-GENERATED]`)
    setStep('preview')
  }

  const sendInvite = async () => {
    setSending(true); setMsg('')
    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
    })
    const data = await res.json()
    if (data.success) {
      setStep('sent')
      load()
    } else {
      setMsg('Error: ' + (data.error || 'Could not send invite. Please try again.'))
      setStep('form')
    }
    setSending(false)
  }

  const resetForm = () => {
    setEmail(''); setName(''); setRole('ADMIN')
    setStep('form'); setPreviewUrl(''); setMsg('')
  }

  const remove = async (targetEmail: string) => {
    await fetch('/api/admin/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail }),
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
    ADMIN: ['#0E1A6E', '#EEF2FF'],
    REVIEWER: ['#D97706', '#FFFBEB'],
  }
  const isSuperAdmin = adminRole === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(adminEmail.toLowerCase())

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>Admin Team</h1>
        <p style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Invite and manage who has access to the Amana Admin dashboard</p>
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

          {/* STEP 1: Form */}
          {step === 'form' && (
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
              {msg && <p style={{ fontSize: 13, color: '#DC2626' }}>{msg}</p>}
              <button onClick={preparePreview}
                style={{ width: '100%', height: 46, background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Preview Invitation Email
              </button>
            </div>
          )}

          {/* STEP 2: Email Preview */}
          {step === 'preview' && (
            <div>
              <div style={{ background: 'var(--admin-bg)', borderRadius: 12, border: '1px solid var(--admin-card-border)', marginBottom: 16, overflow: 'hidden' }}>
                {/* Email header */}
                <div style={{ background: '#0E1A6E', padding: '12px 16px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 2 }}>EMAIL PREVIEW</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>This is exactly what the invitee will receive</p>
                </div>
                {/* Email fields */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-card-border)' }}>
                  {[
                    ['From', 'Amana Admin <noreply@chichatapp.com>'],
                    ['To', email.trim()],
                    ['Subject', "You've been invited to join Amana Admin"],
                    ['Role', role],
                    ['Invited by', adminEmail],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', gap: 12, padding: '5px 0', borderBottom: '1px solid var(--admin-card-border)' }}>
                      <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', width: 80, flexShrink: 0 }}>{l}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text)' }}>{v}</p>
                    </div>
                  ))}
                </div>
                {/* Email body preview */}
                <div style={{ padding: '16px', background: 'white' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>You have been invited!</p>
                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 12 }}>
                    <strong>{adminEmail}</strong> has invited you to join the Amana Admin Dashboard as <strong>{role}</strong>.
                  </p>
                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 16 }}>
                    Click the button below to create your admin account and set your password.
                  </p>
                  <div style={{ background: '#0E1A6E', borderRadius: 8, padding: '12px 20px', textAlign: 'center', marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Accept Invitation and Create Account</p>
                  </div>
                  <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
                    You will sign in with: <strong>{email.trim()}</strong>
                  </p>
                </div>
              </div>

              {msg && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{msg}</p>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('form')}
                  style={{ flex: 1, height: 44, background: 'none', border: '1px solid var(--admin-card-border)', borderRadius: 10, fontSize: 13, color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
                  ← Edit Details
                </button>
                <button onClick={sendInvite} disabled={sending}
                  style={{ flex: 2, height: 44, background: sending ? '#94A3B8' : '#16A34A', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {sending ? (
                    <><span style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}/> Sending...</>
                  ) : (
                    <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Confirm & Send Invite</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Sent confirmation */}
          {step === 'sent' && (
            <div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 18px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginBottom: 2 }}>Invitation Sent Successfully</p>
                  <p style={{ fontSize: 12, color: '#15803D' }}>
                    An email with a registration link was sent to <strong>{email}</strong>. They will receive it shortly and can use it to create their admin account.
                  </p>
                </div>
              </div>
              <button onClick={resetForm}
                style={{ width: '100%', height: 44, background: 'var(--admin-bg)', border: '1px solid var(--admin-card-border)', borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--admin-text)', cursor: 'pointer' }}>
                Invite Another Admin
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin list */}
      <div style={{ background: 'var(--admin-card)', borderRadius: 14, border: '1px solid var(--admin-card-border)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: 'var(--admin-bg)', borderBottom: '2px solid var(--admin-card-border)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: .5 }}>
            {admins.length} Admin{admins.length !== 1 ? 's' : ''}
          </p>
        </div>
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
                  {a.invited_by && <p style={{ fontSize: 10, color: 'var(--admin-text-faint)' }}>Invited by {a.invited_by}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: c, background: b, padding: '3px 10px', borderRadius: 20 }}>{a.role}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: a.active ? '#16A34A' : '#94A3B8', background: a.active ? '#F0FDF4' : 'var(--admin-bg)', padding: '3px 8px', borderRadius: 20 }}>
                  {a.active ? 'Active' : 'Invited'}
                </span>
                {isSuperAdmin && !SUPER_ADMIN_EMAILS.includes(a.email?.toLowerCase()) && (
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

      {confirmRemove && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center', border: '1px solid var(--admin-card-border)' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Remove Admin?</p>
            <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginBottom: 24 }}>
              <strong style={{ color: 'var(--admin-text)' }}>{confirmRemove}</strong> will lose all admin access immediately.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmRemove(null)}
                style={{ flex: 1, height: 42, background: 'none', border: '1px solid var(--admin-card-border)', borderRadius: 10, fontSize: 14, color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
