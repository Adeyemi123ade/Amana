'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading]       = useState(true)
  const [invalid, setInvalid]       = useState(false)
  const [alreadyUsed, setAlreadyUsed] = useState(false)
  const [email, setEmail]           = useState('')
  const [role, setRole]             = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [done, setDone]             = useState(false)

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/accept-invite?token=' + token)
      .then(r => r.json())
      .then(d => {
        if (d.error === 'This invitation has already been used') {
          setAlreadyUsed(true)
        } else if (d.error) {
          setInvalid(true)
        } else {
          setEmail(d.email)
          setRole(d.role)
          setDisplayName(d.display_name || '')
        }
      })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false))
  }, [token])

  const submit = async () => {
    setError('')
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPwd) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, display_name: displayName }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const box: React.CSSProperties = {
    minHeight: '100vh', background: '#F8FAFC',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  }
  const card: React.CSSProperties = {
    background: 'white', borderRadius: 16, border: '1px solid #E2E8F0',
    padding: 36, maxWidth: 420, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  }
  const inp: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px', borderRadius: 9,
    border: '1px solid #E2E8F0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', background: 'white', color: '#1E293B',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#374151', marginBottom: 6,
  }

  if (loading) {
    return (
      <div style={box}>
        <div style={{ textAlign: 'center', color: '#64748B', fontSize: 14 }}>
          Verifying your invitation...
        </div>
      </div>
    )
  }

  if (alreadyUsed) {
    return (
      <div style={box}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
            Already Activated
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
            This invitation has already been used. Your account is active.
          </p>
          <button onClick={() => router.push('/sign-in')}
            style={{ width: '100%', height: 44, background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  if (invalid) {
    return (
      <div style={box}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
            Invalid Invitation
          </h2>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            This invitation link is invalid or has expired. Please ask your Super Admin to send a new invite.
          </p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div style={box}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
            ✓
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
            Account Created
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 6 }}>
            Your admin account is ready.
          </p>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 28 }}>
            Sign in with <strong>{email}</strong> and the password you just set.
          </p>
          <button onClick={() => router.push('/sign-in')}
            style={{ width: '100%', height: 44, background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={box}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: '#0E1A6E', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            Accept Admin Invitation
          </h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            You have been invited to join Amana as <strong>{role}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>Email Address</label>
            <input style={{ ...inp, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }}
              value={email} readOnly />
          </div>

          <div>
            <label style={lbl}>Full Name</label>
            <input style={inp} value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your full name" />
          </div>

          <div>
            <label style={lbl}>Create Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                style={{ ...inp, paddingRight: 42 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: 11, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 15 }}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div>
            <label style={lbl}>Confirm Password</label>
            <input
              type="password"
              style={inp}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Repeat your password"
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, border: '1px solid #FECACA' }}>
              {error}
            </p>
          )}

          <button onClick={submit} disabled={submitting}
            style={{ height: 48, background: submitting ? '#94A3B8' : '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting && (
              <span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}/>
            )}
            {submitting ? 'Creating Account...' : 'Create My Admin Account'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}