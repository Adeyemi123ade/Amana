'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

export default function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    service: '', date: '', time: '', notes: ''
  })

  useEffect(() => {
    const load = async () => {
      const { data: ws } = await supabase
        .from('workspaces')
        .select('id, name, business_type, business_email, currency, slug')
        .eq('slug', slug)
        .maybeSingle()
      setWorkspace(ws)
      setLoading(false)
    }
    load()
  }, [slug])

  // Build available time slots (9am–6pm, 30min intervals)
  const timeSlots = []
  for (let h = 9; h < 18; h++) {
    timeSlots.push(`${String(h).padStart(2,'0')}:00`)
    timeSlots.push(`${String(h).padStart(2,'0')}:30`)
  }

  // Minimum date — tomorrow
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Please enter your name.'); return }
    if (!form.email.trim()) { setError('Please enter your email address.'); return }
    if (!form.service.trim()) { setError('Please enter the service you need.'); return }
    if (!form.date) { setError('Please select a preferred date.'); return }
    if (!form.time) { setError('Please select a preferred time.'); return }

    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase
      .from('booking_requests')
      .insert({
        workspace_id: workspace.id,
        customer_name: form.name.trim(),
        customer_email: form.email.trim().toLowerCase(),
        customer_phone: form.phone.trim() || null,
        service: form.service.trim(),
        preferred_date: form.date,
        preferred_time: form.time,
        notes: form.notes.trim() || null,
        status: 'PENDING',
      })

    if (insertError) {
      setError('Could not submit your booking. Please try again.')
      setSubmitting(false)
      return
    }

    // Notify business owner
    await supabase.from('notifications').insert({
      workspace_id: workspace.id,
      title: 'New Booking Request',
      description: `${form.name} requested a booking for "${form.service}" on ${new Date(form.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} at ${form.time}`,
      type: 'booking',
      read: false,
      link: '/dashboard/appointments',
    })

    setSubmitted(true)
    setSubmitting(false)
  }

  const f = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }))
  const fieldStyle: React.CSSProperties = { width: '100%', height: 44, padding: '0 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', background: 'white', fontFamily: 'inherit' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!workspace) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Booking page not found</p>
      <p style={{ fontSize: 14, color: '#6B7280' }}>This link may be invalid. Please contact the business directly.</p>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 20, padding: '40px 28px', boxShadow: '0 2px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Booking Request Sent!</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>
          Your request has been sent to <strong>{workspace.name}</strong>. They will confirm your appointment shortly.
        </p>
        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, textAlign: 'left' }}>
          {[
            ['Service', form.service],
            ['Date', new Date(form.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
            ['Time', form.time],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>A confirmation will be sent to {form.email}</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '24px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>Amana</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{workspace.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Book an appointment — we will confirm shortly</p>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Your Name *</label>
              <input style={fieldStyle} placeholder="Full name" value={form.name} onChange={e => f('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" style={fieldStyle} placeholder="your@email.com" value={form.email} onChange={e => f('email', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" style={fieldStyle} placeholder="+234 800 000 0000" value={form.phone} onChange={e => f('phone', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Service Needed *</label>
              <input style={fieldStyle} placeholder="e.g. Wedding Photography, Hair Session" value={form.service} onChange={e => f('service', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Preferred Date *</label>
                <input type="date" style={fieldStyle} min={minDateStr} value={form.date} onChange={e => f('date', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Preferred Time *</label>
                <select style={fieldStyle} value={form.time} onChange={e => f('time', e.target.value)}>
                  <option value="">Select time</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Additional Notes</label>
              <textarea style={{ ...fieldStyle, height: 80, padding: '10px 14px', resize: 'none' } as any}
                placeholder="Any special requirements or details..." value={form.notes} onChange={e => f('notes', e.target.value)} />
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              style={{ width: '100%', height: 52, background: submitting ? '#6D28D9cc' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
              {submitting ? <><span style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Sending...</> : '📅 Request Appointment'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 14 }}>
          Powered by <strong style={{ color: '#7C3AED' }}>Amana</strong>
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
