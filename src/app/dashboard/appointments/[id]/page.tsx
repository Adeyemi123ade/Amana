'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const STATUS_COLOR: Record<string,string> = {
  PENDING:'#F59E0B', CONFIRMED:'#3B82F6', COMPLETED:'#22C55E',
  CANCELLED:'#EF4444', NO_SHOW:'#6B7280',
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [appt, setAppt]     = useState<any>(null)
  const [cust, setCust]     = useState<any>(null)
  const [ws, setWs]         = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [updating, setUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data: a, error: e } = await supabase
        .from('appointments').select('*').eq('id', id).single()
      if (e || !a) { setError('Appointment not found.'); setLoading(false); return }
      setAppt(a)
      // Load workspace for business name in emails
      const { data: workspace } = await supabase
        .from('workspaces').select('name').eq('id', a.workspace_id).single()
      setWs(workspace || null)
      if (a.customer_id) {
        const { data: c } = await supabase
          .from('customers').select('*').eq('id', a.customer_id).single()
        setCust(c || null)
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const updateStatus = async (status: string) => {
    if (status === 'CANCELLED') {
      if (!window.confirm('Cancel this appointment? This cannot be undone easily.')) return
    }
    setUpdating(true)
    await supabase.from('appointments').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setAppt((p: any) => ({ ...p, status }))
    setUpdating(false)
  }

  const copyLink = async () => {
    const link = `${window.location.origin}/dashboard/appointments/${id}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const sendEmail = () => {
    if (!cust?.email) {
      alert('This customer has no email address. Please add one in their customer profile first.')
      return
    }
    const apptLink = `${window.location.origin}/dashboard/appointments/${id}`
    const subject = encodeURIComponent(`Appointment Confirmation — ${appt.title}`)
    const body = encodeURIComponent([
      `Dear ${cust.name},`,
      ``,
      `Your appointment has been confirmed. Please find the details below.`,
      ``,
      `Appointment: ${appt.title}`,
      `Date:        ${fmt(appt.start_time)}`,
      `Time:        ${fmtT(appt.start_time)}`,
      `Type:        ${appt.location_type === 'PHYSICAL' ? 'In-Person' : 'Virtual'}`,
      appt.location ? `Location:    ${appt.location}` : ``,
      appt.notes   ? `Notes:       ${appt.notes}` : ``,
      ``,
      `Appointment Link:`,
      apptLink,
      ``,
      `Best regards,`,
      ws?.name || 'Business',
    ].filter(l => l !== null && l !== undefined).join('\n'))
    window.location.href = `mailto:${cust.email}?subject=${subject}&body=${body}`
    setEmailSent(true)
  }

  const resendEmail = () => {
    setEmailSent(false)
    setTimeout(() => sendEmail(), 100)
  }

  const na = (v: any) => v || 'Not provided'
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-NG',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  const fmtT = (iso: string) => new Date(iso).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{width:28,height:28,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:300,textAlign:'center',padding:24}}>
      <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
      <p style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:6}}>Could not load appointment</p>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>{error}</p>
      <div style={{display:'flex',gap:10}}>
        <button onClick={load} style={{padding:'10px 20px',background:'var(--accent)',color:'white',border:'none',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer'}}>Retry</button>
        <button onClick={() => router.push('/dashboard/appointments')} style={{padding:'10px 20px',background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,fontSize:13,fontWeight:500,color:'var(--text-muted)',cursor:'pointer'}}>Back</button>
      </div>
    </div>
  )

  const card: React.CSSProperties = {background:'var(--card)',borderRadius:14,border:'1px solid var(--border)',padding:'20px',marginBottom:14}
  const row = (label: string, value: string) => (
    <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
      <span style={{fontSize:13,color:'var(--text-muted)'}}>{label}</span>
      <span style={{fontSize:13,fontWeight:500,color:'var(--text)',textAlign:'right',maxWidth:'60%'}}>{value}</span>
    </div>
  )

  const sc = STATUS_COLOR[appt.status] || '#6B7280'

  return (
    <div style={{maxWidth:580}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={() => router.push('/dashboard/appointments')}
          style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,padding:'8px 14px'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <div style={{flex:1,minWidth:0}}>
          <h1 style={{fontSize:18,fontWeight:700,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{appt.title}</h1>
        </div>
        <span style={{fontSize:11,fontWeight:700,color:sc,background:`${sc}18`,padding:'4px 10px',borderRadius:20,flexShrink:0,border:`1px solid ${sc}33`}}>
          {appt.status}
        </span>
      </div>

      {/* Customer */}
      <div style={card}>
        <p style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>Customer</p>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:42,height:42,borderRadius:'50%',background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'var(--accent)',flexShrink:0}}>
            {(cust?.name||'?')[0].toUpperCase()}
          </div>
          <div>
            <p style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>{na(cust?.name)}</p>
            <p style={{fontSize:12,color:'var(--text-muted)'}}>{na(cust?.email)}</p>
            {cust?.phone && <p style={{fontSize:12,color:'var(--text-muted)'}}>{cust.phone}</p>}
          </div>
        </div>
      </div>

      {/* Appointment info */}
      <div style={card}>
        <p style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>Appointment Details</p>
        {row('Date', fmt(appt.start_time))}
        {row('Time', fmtT(appt.start_time))}
        {appt.end_time && row('End Time', fmtT(appt.end_time))}
        {row('Type', appt.location_type === 'PHYSICAL' ? '📍 In-Person' : '💻 Virtual')}
        {row('Location', na(appt.location))}
        {appt.notes && row('Notes', appt.notes)}
      </div>

      {/* Actions */}
      <div style={card}>
        <p style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>Actions</p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>

          {/* Send Email — same pattern as invoice */}
          {cust?.email ? (
            <>
              <button onClick={sendEmail}
                style={{width:'100%',height:48,background:emailSent?'#22C55E':'#111827',color:'white',border:'none',borderRadius:12,fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
                </svg>
                {emailSent ? '✓ Email Opened — Check Your Email App' : `Send Appointment to ${cust.email}`}
              </button>
              {emailSent && (
                <button onClick={resendEmail}
                  style={{width:'100%',height:38,background:'none',border:'1px solid var(--border-light)',borderRadius:10,fontSize:13,fontWeight:600,color:'var(--text-muted)',cursor:'pointer'}}>
                  Resend Appointment Email →
                </button>
              )}
            </>
          ) : (
            <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:10,padding:'12px 14px',fontSize:13,color:'#92400E'}}>
              No email for this customer. Add one to their profile to send the appointment details.
            </div>
          )}

          {/* Copy link */}
          <button onClick={copyLink}
            style={{width:'100%',height:44,background:copied?'#22C55E':'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:10,fontSize:13,fontWeight:600,color:copied?'white':'var(--text)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
            {copied ? '✓ Link Copied!' : '🔗 Copy Appointment Link'}
          </button>

          {/* Status actions */}
          {appt.status === 'PENDING' && (
            <button onClick={() => updateStatus('CONFIRMED')} disabled={updating}
              style={{width:'100%',height:40,background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:10,fontSize:13,fontWeight:600,color:'#3B82F6',cursor:'pointer'}}>
              Mark as Confirmed
            </button>
          )}
          {appt.status === 'CONFIRMED' && (
            <button onClick={() => updateStatus('COMPLETED')} disabled={updating}
              style={{width:'100%',height:40,background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:10,fontSize:13,fontWeight:600,color:'#22C55E',cursor:'pointer'}}>
              Mark as Completed
            </button>
          )}
          {['PENDING','CONFIRMED'].includes(appt.status) && (
            <button onClick={() => updateStatus('CANCELLED')} disabled={updating}
              style={{width:'100%',height:40,background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:10,fontSize:13,fontWeight:600,color:'#EF4444',cursor:'pointer'}}>
              Cancel Appointment
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
