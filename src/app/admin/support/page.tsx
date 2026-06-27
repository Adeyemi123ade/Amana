'use client'
import { useState, useEffect } from 'react'

type Msg = {
  id: string; name: string; email: string; subject: string;
  message: string; status: string; created_at: string;
}

export default function AdminSupportPage() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmEmail, setConfirmEmail] = useState<Msg|null>(null)
  const [replyOpen, setReplyOpen] = useState<Msg|null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sentMsg, setSentMsg] = useState('')

  // CRITICAL: [] dependency array means this runs ONCE on mount only
  useEffect(() => {
    fetch('/api/admin/support')
      .then(r => r.json())
      .then(d => {
        setMsgs(d.messages || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load support messages')
        setLoading(false)
      })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setMsgs(prev => prev.map(m => m.id === id ? { ...m, status } : m))
  }

  const openReply = (m: Msg) => {
    setConfirmEmail(null)
    setReplyOpen(m)
    setReplyBody(
      'Dear ' + m.name + ',\n\nThank you for reaching out to Amana Support.\n\nRegarding your message:\n"' + m.subject + '"\n\n' +
      '[Your reply here]\n\nBest regards,\nAmana Support Team'
    )
  }

  const sendReply = async () => {
    if (!replyOpen) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyOpen.email,
          subject: 'Re: ' + (replyOpen.subject || 'Your Support Request'),
          body: replyBody,
          from_name: 'Amana Support',
        }),
      })
      const data = await res.json()
      if (data.success || res.ok) {
        setSentMsg('Reply sent to ' + replyOpen.email)
        await updateStatus(replyOpen.id, 'RESOLVED')
        setReplyOpen(null)
        setTimeout(() => setSentMsg(''), 4000)
      } else {
        setSentMsg('Error: ' + (data.error || 'Could not send'))
      }
    } catch {
      setSentMsg('Connection error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const sc: Record<string, [string, string]> = {
    OPEN: ['#DC2626', '#FEF2F2'],
    IN_PROGRESS: ['#D97706', '#FFFBEB'],
    RESOLVED: ['#16A34A', '#F0FDF4'],
    CLOSED: ['#6B7280', '#F9FAFB'],
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>Support Inbox</h1>
        <p style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>
          {loading ? 'Loading...' : error ? error : msgs.filter(m => m.status === 'OPEN').length + ' open messages'}
        </p>
      </div>

      {sentMsg && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#16A34A' }}>
          {sentMsg}
        </div>
      )}

      <div style={{ background: 'var(--admin-card)', borderRadius: 12, border: '1px solid var(--admin-card-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 14 }}>Loading support messages...</div>
        ) : error ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#DC2626', fontSize: 14 }}>{error}</div>
        ) : msgs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 14 }}>No support messages yet</div>
        ) : msgs.map((m) => {
          const [c, b] = sc[m.status] || ['#6B7280', '#F9FAFB']
          return (
            <div key={m.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 2 }}>
                    {m.name}
                    <button onClick={() => setConfirmEmail(m)}
                      style={{ fontSize: 12, fontWeight: 400, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, textDecoration: 'underline', padding: 0 }}>
                      {m.email}
                    </button>
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text-secondary)' }}>{m.subject || 'No subject'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c, background: b, padding: '3px 8px', borderRadius: 20 }}>{m.status}</span>
                  <p style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>
                    {new Date(m.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--admin-text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{m.message}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {m.status === 'OPEN' && (
                  <button onClick={() => updateStatus(m.id, 'IN_PROGRESS')}
                    style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', cursor: 'pointer' }}>
                    Mark In Progress
                  </button>
                )}
                {['OPEN', 'IN_PROGRESS'].includes(m.status) && (
                  <button onClick={() => updateStatus(m.id, 'RESOLVED')}
                    style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', cursor: 'pointer' }}>
                    Mark Resolved
                  </button>
                )}
                <button onClick={() => setConfirmEmail(m)}
                  style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#EDE9FE', border: '1px solid #DDD6FE', color: '#7C3AED', cursor: 'pointer' }}>
                  Reply by Email
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirm email dialog */}
      {confirmEmail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center', border: '1px solid var(--admin-card-border)' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Send email reply?</p>
            <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginBottom: 24 }}>
              You are about to reply to <strong style={{ color: 'var(--admin-text)' }}>{confirmEmail.email}</strong>
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmEmail(null)}
                style={{ flex: 1, height: 42, background: 'none', border: '1px solid var(--admin-card-border)', borderRadius: 10, fontSize: 13, color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => openReply(confirmEmail)}
                style={{ flex: 1, height: 42, background: '#7C3AED', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                Yes, Compose Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply modal */}
      {replyOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--admin-card-border)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>Email Reply</h3>
              <button onClick={() => setReplyOpen(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--admin-text-muted)', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ background: 'var(--admin-bg)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 2 }}>To</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{replyOpen.email}</p>
                <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 6, marginBottom: 2 }}>Subject</p>
                <p style={{ fontSize: 13, color: 'var(--admin-text)' }}>Re: {replyOpen.subject || 'Your Support Request'}</p>
              </div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: 6 }}>Message</label>
              <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} rows={10}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--admin-card-border)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, background: 'var(--admin-bg)', color: 'var(--admin-text)' }}/>
              {sentMsg && <p style={{ fontSize: 13, color: sentMsg.startsWith('Error') ? '#DC2626' : '#16A34A', marginTop: 8 }}>{sentMsg}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setReplyOpen(null)}
                  style={{ flex: 1, height: 44, background: 'none', border: '1px solid var(--admin-card-border)', borderRadius: 10, fontSize: 13, color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={sendReply} disabled={sending}
                  style={{ flex: 2, height: 44, background: '#7C3AED', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: 'white', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
