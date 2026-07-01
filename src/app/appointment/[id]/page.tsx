'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', COMPLETED: '#22C55E',
  CANCELLED: '#EF4444', NO_SHOW: '#6B7280',
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending Confirmation', CONFIRMED: 'Confirmed', COMPLETED: 'Completed',
  CANCELLED: 'Cancelled', NO_SHOW: 'No Show',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

export default function PublicAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [appt, setAppt] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: a } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (!a) { setLoading(false); return }
      setAppt(a)

      // Two separate queries, not a nested join — anon key joins are unreliable
      const { data: ws } = await supabase
        .from('workspaces')
        .select('name, business_type')
        .eq('id', a.workspace_id)
        .maybeSingle()
      setWorkspace(ws || null)

      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!appt) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Appointment not found</p>
      <p style={{ fontSize: 14, color: '#6B7280' }}>This link may be invalid. Please contact the business directly.</p>
    </div>
  )

  const sc = STATUS_COLOR[appt.status] || '#6B7280'
  const row = (label: string, value: string) => value ? (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'right', maxWidth: '65%' }}>{value}</span>
    </div>
  ) : null

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
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{workspace?.name || 'Appointment'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Your appointment details</p>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{appt.title}</h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: sc, background: sc + '18', padding: '4px 10px', borderRadius: 20, border: '1px solid ' + sc + '33', flexShrink: 0, marginLeft: 10 }}>
              {STATUS_LABEL[appt.status] || appt.status}
            </span>
          </div>

          {row('Date', fmtDate(appt.start_time))}
          {row('Time', fmtTime(appt.start_time))}
          {row('Type', appt.location_type === 'PHYSICAL' ? 'In-Person' : 'Virtual')}
          {appt.location_type === 'PHYSICAL'
            ? row('Location', appt.location)
            : null}
          {row('Notes', appt.notes)}

          {appt.location_type !== 'PHYSICAL' && appt.location && appt.status !== 'CANCELLED' && (
            <a href={appt.location} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', textAlign: 'center', marginTop: 16, height: 48, lineHeight: '48px', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
              🔗 Join Meeting
            </a>
          )}

          {appt.status === 'CANCELLED' && (
            <div style={{ marginTop: 16, background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>
              This appointment has been cancelled.
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 14 }}>
          Questions about this appointment? Contact {workspace?.name || 'the business'} directly.
        </p>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
          Powered by <strong style={{ color: '#7C3AED' }}>Amana</strong>
        </p>
      </div>
    </div>
  )
}
