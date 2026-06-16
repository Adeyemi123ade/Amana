'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [appt, setAppt] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: ws } = await supabase.from('workspaces').select('*').eq('created_by', user?.id).maybeSingle()
      setWorkspace(ws)
      const { data } = await supabase.from('appointments').select('*, customers(name,email,phone)').eq('id', id).single()
      setAppt(data)
      setLoading(false)
    }
    load()
  }, [id])

  const updateStatus = async (status: string) => {
    // Confirmation for destructive actions
    if (status === 'CANCELLED') {
      const confirmed = window.confirm('Cancel this appointment? This will notify the customer and cannot be undone easily.')
      if (!confirmed) return
    }
    setUpdating(true)
    await supabase.from('appointments').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setAppt((prev: any) => ({ ...prev, status }))
    // Log activity
    const { data: { user } } = await supabase.auth.getUser()
    if (user && workspace) {
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        user_id: user.id,
        action: `Appointment ${status.toLowerCase()}`,
        entity_type: 'appointment',
        entity_id: id,
        metadata: { title: appt?.title, status },
      })
    }
    setUpdating(false)
  }

  const apptLink = typeof window !== 'undefined' ? `${window.location.origin}/appointment/${id}` : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(apptLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendEmail = () => {
    if (!appt?.customers?.email) return
    const date = new Date(appt.start_time).toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    const time = new Date(appt.start_time).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' })
    const subject = encodeURIComponent(`Appointment Confirmation — ${appt.title}`)
    const body = encodeURIComponent(
      `Dear ${appt.customers.name},\n\n` +
      `Your appointment has been confirmed.\n\n` +
      `Service: ${appt.title}\n` +
      `Date: ${date}\n` +
      `Time: ${time}\n` +
      `${appt.location ? `Location: ${appt.location}\n` : ''}` +
      `${appt.notes ? `Notes: ${appt.notes}\n` : ''}` +
      `\nBest regards,\n${workspace?.name || 'Amana Business'}`
    )
    window.open(`mailto:${appt.customers.email}?subject=${subject}&body=${body}`)
    setEmailSent(true)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{width:28,height:28,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!appt) return (
    <div style={{textAlign:'center',padding:48}}>
      <p style={{color:'var(--text-muted)',marginBottom:12}}>Appointment not found</p>
      <Link href="/dashboard/appointments" style={{color:'var(--accent)',textDecoration:'none'}}>Back to appointments</Link>
    </div>
  )

  const statusColors: Record<string,[string,string]> = {
    CONFIRMED: ['#22C55E','#F0FDF4'],
    PENDING: ['#F59E0B','#FFFBEB'],
    CANCELLED: ['#EF4444','#FEF2F2'],
    COMPLETED: ['#6B7280','#F9FAFB'],
  }
  const [sc, sb] = statusColors[appt.status] || ['#6B7280','#F9FAFB']
  const date = new Date(appt.start_time).toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const time = new Date(appt.start_time).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' })
  const endTime = new Date(appt.end_time).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' })

  return (
    <div style={{maxWidth:560,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <Link href="/dashboard/appointments" style={{color:'var(--text-muted)',textDecoration:'none'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <h1 style={{fontSize:20,fontWeight:700,color:'var(--text)'}}>Appointment Details</h1>
      </div>

      <div style={{background:'var(--card)',borderRadius:14,border:'1px solid var(--border)',padding:'24px',marginBottom:12}}>
        {/* Status + actions */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <span style={{fontSize:12,fontWeight:700,color:sc,background:sb,padding:'4px 12px',borderRadius:20}}>{appt.status}</span>
          <div style={{display:'flex',gap:6}}>
            {appt.status !== 'COMPLETED' && (
              <button onClick={() => updateStatus('COMPLETED')} disabled={updating}
                style={{fontSize:12,fontWeight:600,color:'#22C55E',background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:8,padding:'5px 10px',cursor:'pointer'}}>
                Mark Complete
              </button>
            )}
            {appt.status !== 'CANCELLED' && (
              <button onClick={() => updateStatus('CANCELLED')} disabled={updating}
                style={{fontSize:12,fontWeight:600,color:'#EF4444',background:'#FEF2F2',border:'1px solid #FEE2E2',borderRadius:8,padding:'5px 10px',cursor:'pointer'}}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <p style={{fontSize:22,fontWeight:800,color:'var(--text)',marginBottom:4}}>{appt.title}</p>
        {appt.customers && (
          <p style={{fontSize:15,fontWeight:500,color:'var(--text-secondary)',marginBottom:20}}>{appt.customers.name}</p>
        )}

        {/* Details grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,borderTop:'1px solid var(--border)',paddingTop:16,marginBottom:16}}>
          <div>
            <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>Date</p>
            <p style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{date}</p>
          </div>
          <div>
            <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>Time</p>
            <p style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{time} — {endTime}</p>
          </div>
          {appt.location && (
            <div>
              <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>Location</p>
              <p style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{appt.location}</p>
            </div>
          )}
          {appt.customers?.email && (
            <div>
              <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>Customer Email</p>
              <p style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{appt.customers.email}</p>
            </div>
          )}
          {appt.customers?.phone && (
            <div>
              <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>Customer Phone</p>
              <p style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{appt.customers.phone}</p>
            </div>
          )}
        </div>

        {appt.notes && (
          <div style={{background:'var(--bg-secondary)',borderRadius:10,padding:'12px 14px',marginBottom:16}}>
            <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Notes</p>
            <p style={{fontSize:13,color:'var(--text)',lineHeight:1.6}}>{appt.notes}</p>
          </div>
        )}
      </div>

      {/* Actions — only show if not cancelled/completed */}
      {!['CANCELLED','COMPLETED'].includes(appt.status) && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {appt.customers?.email ? (
            <button onClick={sendEmail}
              style={{width:'100%',height:48,background:emailSent?'#22C55E':'#111827',color:'white',border:'none',borderRadius:12,fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
              {emailSent ? '✓ Email Sent!' : `Send Reminder to ${appt.customers.email}`}
            </button>
          ) : (
            <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:10,padding:'12px 14px',fontSize:13,color:'#92400E'}}>
              No email address for this customer. Add one to their profile to send reminders.
            </div>
          )}
          <button onClick={copyLink}
            style={{width:'100%',height:42,background:'var(--card)',border:'1px solid var(--border-light)',borderRadius:10,fontSize:13,fontWeight:500,color:'var(--text-secondary)',cursor:'pointer'}}>
            {copied ? '✓ Link Copied!' : 'Copy Appointment Link'}
          </button>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
