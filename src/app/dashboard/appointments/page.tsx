'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/utils/index'

const supabase = createClient()

const inp: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white' }
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function AppointmentsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(now.getDate())
  const [appointments, setAppointments] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const wsRef = useRef<any>(null)
  const [wsId, setWsId] = useState<string|null>(null)
  const [pageError, setPageError] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [view, setView] = useState<'calendar'|'list'>('calendar')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAppt, setSavedAppt] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [form, setForm] = useState({
    customerId:'', title:'', date:'', time:'', duration:'60',
    location:'', notes:'', status:'CONFIRMED'
  })

  const selectedCustomer = customers.find(c => c.id === form.customerId)

  const load = async () => {
    setPageLoading(true)
    setPageError('')
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setPageError('Not authenticated'); setPageLoading(false); return }
      setUser(u)
      const { data: ws, error: wsErr } = await supabase.from('workspaces').select('*').eq('created_by', u.id).maybeSingle()
      if (wsErr) throw new Error('Could not load workspace: ' + wsErr.message)
      if (!ws) { setPageLoading(false); return }
      setWorkspace(ws)
      wsRef.current = ws
      setWsId(ws.id)

      // Fetch appointments and customers separately — do NOT use Supabase join
      // The join 'customers(name,email)' fails if FK metadata is not detected
      const [apptRes, custRes] = await Promise.all([
        supabase.from('appointments').select('*').eq('workspace_id', ws.id).order('start_time', { ascending: true }),
        supabase.from('customers').select('id,name,email,phone').eq('workspace_id', ws.id),
      ])
      if (apptRes.error) throw new Error(apptRes.error.message)

      const custList = custRes.data || []
      setCustomers(custList)

      // Merge customer info into each appointment manually
      const custMap = new Map(custList.map(c => [c.id, c]))
      const merged = (apptRes.data || []).map(a => ({
        ...a,
        customers: a.customer_id ? custMap.get(a.customer_id) || null : null,
      }))
      setAppointments(merged)
    } catch (e: any) {
      setPageError(e.message || 'Unable to load appointments right now.')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const apptDays = new Set(appointments.map(a => {
    const d = new Date(a.start_time)
    return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null
  }).filter(Boolean))

  const selectedDateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
  const selectedAppts = appointments.filter(a => {
    const d = new Date(a.start_time)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay
  })

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Please enter an appointment title'); return }
    if (!form.date) { setError('Please select a date'); return }
    if (!form.time) { setError('Please select a time'); return }
    const ws = wsRef.current
    if (!ws) { setError('Still loading your workspace. Please wait and try again.'); return }

    setSaving(true)
    setError('')

    const startTime = new Date(`${form.date}T${form.time}:00`)
    const endTime = new Date(startTime.getTime() + parseInt(form.duration) * 60000)

    // ── CONFLICT DETECTION ────────────────────────────────
    // Check for any existing non-cancelled appointment that overlaps this slot
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id, title, start_time, end_time')
      .eq('workspace_id', ws.id)
      .not('status', 'in', '("CANCELLED","COMPLETED")')
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString())

    if (conflicts && conflicts.length > 0) {
      const clash = conflicts[0]
      const clashTime = new Date(clash.start_time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
      setError(`Time conflict: "${clash.title}" is already booked at ${clashTime} on this day. Please choose a different time.`)
      setSaving(false)
      return
    }

    const insertData: any = {
      workspace_id: ws.id,
      title: form.title.trim(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status,
    }
    if (form.customerId) insertData.customer_id = form.customerId

    const { data: appt, error: err } = await supabase
      .from('appointments').insert(insertData).select('*').single()

    setSaving(false)

    if (err) {
      const msg = err.message || ''
      if (msg.includes('violates row-level') || msg.includes('policy')) {
        setError('Permission issue. Please sign out and sign back in.')
      } else {
        setError(`Could not save appointment: ${msg}`)
      }
      return
    }

    // Attach customer info manually since we no longer use the join
    const apptWithCustomer = { ...appt, customers: selectedCustomer || null }
    setSavedAppt(apptWithCustomer)
    // Create notification
    const date = new Date(appt.start_time).toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short'})
    await supabase.from('notifications').insert({
      workspace_id: ws.id, read: false, type: 'appointment',
      title: 'New appointment scheduled',
      description: `${form.title} on ${date}${appt.customers?.name ? ` with ${appt.customers.name}` : ''}`,
      link: `/dashboard/appointments/${appt.id}`,
    })
    setEmailSent(false)
    setCopied(false)
    await load()
  }

  const apptLink = savedAppt
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/appointment/${savedAppt.id}`
    : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(apptLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendEmail = async () => {
    if (!savedAppt) return
    const customerEmail = savedAppt.customers?.email || selectedCustomer?.email
    if (!customerEmail) {
      setError('This customer has no email address. Please add one to their profile first.')
      return
    }
    setSendingEmail(true)

    // Use Supabase Edge Function or mailto as fallback
    // For now, open mailto — replace with Resend API call on deployment
    const ws = wsRef.current || workspace
    const senderName = ws?.name || 'Amana Business'
    const subject = encodeURIComponent(`Appointment Confirmation — ${savedAppt.title}`)
    const date = new Date(savedAppt.start_time).toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    const time = new Date(savedAppt.start_time).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' })
    const body = encodeURIComponent(
      `Dear ${savedAppt.customers?.name || 'Valued Customer'},\n\n` +
      `Your appointment has been confirmed.\n\n` +
      `Appointment: ${savedAppt.title}\n` +
      `Date: ${date}\n` +
      `Time: ${time}\n` +
      `${savedAppt.location ? `Location: ${savedAppt.location}\n` : ''}` +
      `${savedAppt.notes ? `Notes: ${savedAppt.notes}\n` : ''}` +
      `\nBest regards,\n${senderName}`
    )
    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`)
    setSendingEmail(false)
    setEmailSent(true)
  }

  const resetModal = () => {
    setShowModal(false)
    setSavedAppt(null)
    setEmailSent(false)
    setCopied(false)
    setError('')
    setForm({ customerId:'', title:'', date:'', time:'', duration:'60', location:'', notes:'', status:'CONFIRMED' })
  }

  if (pageLoading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{width:28,height:28,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (pageError) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:300,padding:24,textAlign:'center'}}>
      <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
      <p style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:6}}>Unable to load appointments right now.</p>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>{pageError}</p>
      <div style={{display:'flex',gap:10}}>
        <button onClick={load} style={{padding:'9px 20px',background:'var(--accent)',color:'white',border:'none',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer'}}>Try Again</button>
        <a href="/dashboard" style={{padding:'9px 20px',background:'var(--bg-secondary)',color:'var(--text-muted)',border:'1px solid var(--border-light)',borderRadius:9,fontSize:13,fontWeight:600,textDecoration:'none'}}>Back to Dashboard</a>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <h1 style={{fontSize:22, fontWeight:700, color:'var(--text)'}}>Appointments</h1>
          {/* View toggle */}
          <div style={{display:'flex', background:'var(--bg-secondary)', borderRadius:8, padding:3, gap:2}}>
            {(['calendar','list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{padding:'5px 14px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
                  background: view===v ? 'var(--card)' : 'transparent',
                  color: view===v ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: view===v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}}>
                {v === 'calendar' ? '📅 Calendar' : '☰ List'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); setSavedAppt(null); setForm(f => ({...f, date: selectedDateStr})) }}
          style={{display:'flex', alignItems:'center', gap:6, background:'#7C3AED', color:'white', padding:'10px 18px', borderRadius:10, fontSize:14, fontWeight:600, border:'none', cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Appointment
        </button>
      </div>

      {/* List view */}
      {view === 'list' && (
        <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden', marginBottom:16}}>
          {appointments.length === 0 ? (
            <div style={{textAlign:'center', padding:'48px 20px'}}>
              <div style={{fontSize:40, marginBottom:12}}>📅</div>
              <p style={{fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:4}}>No appointments yet</p>
              <p style={{fontSize:13, color:'var(--text-muted)'}}>Click New Appointment above to schedule one</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 130px 80px 90px', gap:12, padding:'10px 20px', background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)'}}>
                {['Customer / Service','Date & Time','Status',''].map(h => (
                  <p key={h} style={{fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.4}}>{h}</p>
                ))}
              </div>
              {appointments.map((a: any) => {
                const statusC: Record<string,string> = { CONFIRMED:'#22C55E', PENDING:'#F59E0B', CANCELLED:'#EF4444', COMPLETED:'#6B7280' }
                const statusB: Record<string,string> = { CONFIRMED:'#F0FDF4', PENDING:'#FFFBEB', CANCELLED:'#FEF2F2', COMPLETED:'#F9FAFB' }
                return (
                  <div key={a.id} style={{display:'grid', gridTemplateColumns:'1fr 130px 80px 90px', gap:12, padding:'14px 20px', borderTop:'1px solid var(--border)', alignItems:'center'}}>
                    <div style={{minWidth:0}}>
                      <p style={{fontSize:14, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.title}</p>
                      <p style={{fontSize:12, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.customers?.name || 'No customer'}</p>
                    </div>
                    <div>
                      <p style={{fontSize:12, fontWeight:500, color:'var(--text)'}}>{new Date(a.start_time).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</p>
                      <p style={{fontSize:11, color:'var(--text-muted)'}}>{formatTime(a.start_time)}</p>
                    </div>
                    <span style={{fontSize:11, fontWeight:700, color:statusC[a.status]||'#6B7280', background:statusB[a.status]||'#F9FAFB', padding:'3px 8px', borderRadius:20, display:'inline-block'}}>
                      {a.status}
                    </span>
                    <Link href={`/dashboard/appointments/${a.id}`}
                      style={{fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:600}}>
                      View →
                    </Link>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Calendar view */}
      {view === 'calendar' && (
        <div className="three-col-grid">
        {/* Calendar */}
        <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'20px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
            <button onClick={prevMonth} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px 10px', fontSize:20}}>‹</button>
            <p style={{fontSize:14, fontWeight:600, color:'var(--text)'}}>{MONTH_NAMES[month]} {year}</p>
            <button onClick={nextMonth} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px 10px', fontSize:20}}>›</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6}}>
            {DAY_NAMES.map(d => <div key={d} style={{textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)', padding:'4px 0', textTransform:'uppercase'}}>{d}</div>)}
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2}}>
            {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`}/>)}
            {Array.from({length:daysInMonth}).map((_,i) => {
              const day = i+1
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
              const isSelected = day === selectedDay
              const hasAppt = apptDays.has(day)
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  style={{textAlign:'center', padding:'7px 0', borderRadius:8, fontSize:13, border:'none', cursor:'pointer',
                    fontWeight: isSelected||isToday ? 700 : 400,
                    color: isSelected ? 'white' : isToday ? '#7C3AED' : 'var(--text)',
                    background: isSelected ? '#7C3AED' : 'transparent', position:'relative'}}>
                  {day}
                  {hasAppt && !isSelected && <span style={{position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'#7C3AED', display:'block'}}/>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Schedule */}
        <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column'}}>
          <p style={{fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:14}}>
            {new Date(year, month, selectedDay).toLocaleDateString('en-NG', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
          </p>
          <div style={{flex:1}}>
            {selectedAppts.length === 0 ? (
              <div style={{textAlign:'center', padding:'32px 0'}}>
                <div style={{fontSize:36, marginBottom:8}}>📅</div>
                <p style={{fontSize:14, color:'var(--text-muted)', marginBottom:4}}>No appointments this day</p>
                <p style={{fontSize:12, color:'var(--text-muted)'}}>Click New Appointment above to add one</p>
              </div>
            ) : selectedAppts.map((a:any) => (
              <div key={a.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:10, background:'var(--bg-secondary)', marginBottom:8}}>
                <span style={{fontSize:12, fontWeight:600, color:'var(--text-muted)', minWidth:60, flexShrink:0}}>{formatTime(a.start_time)}</span>
                <div style={{flex:1, minWidth:0}}>
                  <p style={{fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.customers?.name || 'No customer'}</p>
                  <p style={{fontSize:12, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.title}</p>
                </div>
                <span style={{fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, flexShrink:0,
                  color:a.status==='CONFIRMED'?'#22C55E':'#F59E0B',
                  background:a.status==='CONFIRMED'?'#F0FDF4':'#FFFBEB'}}>
                  {a.status==='CONFIRMED'?'Confirmed':'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )} {/* end calendar view */}

      {/* Modal */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
          <div style={{background:'white', borderRadius:16, padding:'24px', width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto'}}>

            {/* After save — show link and email options */}
            {savedAppt ? (
              <div>
                <div style={{textAlign:'center', marginBottom:20}}>
                  <div style={{width:52, height:52, borderRadius:'50%', background:'#F0FDF4', border:'2px solid #22C55E', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px'}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <h2 style={{fontSize:18, fontWeight:700, color:'#111827', marginBottom:4}}>Appointment Saved!</h2>
                  <p style={{fontSize:13, color:'#6B7280'}}>
                    {savedAppt.customers?.name
                      ? `Send the appointment details to ${savedAppt.customers.name}`
                      : 'Share the appointment link below'}
                  </p>
                </div>

                {/* Appointment summary */}
                <div style={{background:'#F9FAFB', borderRadius:10, padding:'14px', marginBottom:16}}>
                  <p style={{fontSize:13, fontWeight:600, color:'#111827', marginBottom:6}}>{savedAppt.title}</p>
                  <p style={{fontSize:12, color:'#6B7280'}}>
                    {new Date(savedAppt.start_time).toLocaleDateString('en-NG', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
                    {' at '}
                    {new Date(savedAppt.start_time).toLocaleTimeString('en-NG', {hour:'2-digit', minute:'2-digit'})}
                  </p>
                  {savedAppt.location && <p style={{fontSize:12, color:'#6B7280', marginTop:2}}>📍 {savedAppt.location}</p>}
                </div>

                {error && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:12}}>{error}</div>}

                {/* Copy link */}
                <div style={{marginBottom:12}}>
                  <p style={{fontSize:12, fontWeight:600, color:'#374151', marginBottom:6}}>Appointment Link</p>
                  <div style={{display:'flex', gap:8}}>
                    <div style={{flex:1, background:'#F9FAFB', borderRadius:8, padding:'10px 12px', border:'1px solid #E5E7EB', overflow:'hidden'}}>
                      <p style={{fontSize:12, color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{apptLink}</p>
                    </div>
                    <button onClick={copyLink}
                      style={{height:40, padding:'0 14px', background:copied?'#22C55E':'#7C3AED', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', flexShrink:0, transition:'background 0.2s'}}>
                      {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Send email */}
                {savedAppt.customers?.email || selectedCustomer?.email ? (
                  <button onClick={sendEmail} disabled={sendingEmail || emailSent}
                    style={{width:'100%', height:48, background: emailSent ? '#22C55E' : '#111827', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10, opacity:sendingEmail?0.7:1}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                    {emailSent ? '✓ Email Sent!' : `Send Email to ${savedAppt.customers?.email || selectedCustomer?.email}`}
                  </button>
                ) : (
                  <div style={{background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#92400E', marginBottom:10}}>
                    No email address for this customer. Add one in their profile to send email.
                  </div>
                )}

                <button onClick={resetModal}
                  style={{width:'100%', height:42, background:'white', border:'1px solid #E5E7EB', borderRadius:10, fontSize:14, color:'#374151', cursor:'pointer'}}>
                  Done
                </button>
              </div>
            ) : (
              /* New appointment form */
              <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
                  <h2 style={{fontSize:18, fontWeight:700, color:'#111827'}}>New Appointment</h2>
                  <button onClick={resetModal} style={{background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:24, lineHeight:1}}>×</button>
                </div>
                {error && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:14, lineHeight:1.5}}>{error}</div>}
                <div style={{display:'flex', flexDirection:'column', gap:14}}>
                  {/* Customer — email auto-shown */}
                  <div>
                    <label style={lbl}>Customer <span style={{color:'#9CA3AF', fontWeight:400}}>(optional)</span></label>
                    <select value={form.customerId} onChange={e => setForm({...form, customerId:e.target.value})} style={inp}>
                      <option value="">No customer</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.email ? ` — ${c.email}` : ''}</option>)}
                    </select>
                    {form.customerId && selectedCustomer?.email && (
                      <p style={{fontSize:11, color:'#22C55E', marginTop:4}}>✓ Confirmation email will be sent to: <strong>{selectedCustomer.email}</strong></p>
                    )}
                    {form.customerId && !selectedCustomer?.email && (
                      <p style={{fontSize:11, color:'#F59E0B', marginTop:4}}>⚠ This customer has no email — add one to send confirmations</p>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>Title <span style={{color:'#EF4444'}}>*</span></label>
                    <input style={inp} placeholder="e.g. Consultation, Hair Session, Strategy Call" value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    <div>
                      <label style={lbl}>Date <span style={{color:'#EF4444'}}>*</span></label>
                      <input type="date" style={inp} value={form.date} onChange={e => setForm({...form, date:e.target.value})} />
                    </div>
                    <div>
                      <label style={lbl}>Time <span style={{color:'#EF4444'}}>*</span></label>
                      <input type="time" style={inp} value={form.time} onChange={e => setForm({...form, time:e.target.value})} />
                    </div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    <div>
                      <label style={lbl}>Duration</label>
                      <select value={form.duration} onChange={e => setForm({...form, duration:e.target.value})} style={inp}>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Status</label>
                      <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} style={inp}>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Location</label>
                    <input style={inp} placeholder="Online, Office, Client site..." value={form.location} onChange={e => setForm({...form, location:e.target.value})} />
                  </div>
                  <div>
                    <label style={lbl}>Notes</label>
                    <textarea style={{...inp, height:70, paddingTop:10, resize:'none'}} placeholder="Any notes..." value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
                  </div>
                  <div style={{display:'flex', gap:10}}>
                    <button onClick={resetModal}
                      style={{flex:1, height:44, background:'white', border:'1px solid #E5E7EB', borderRadius:10, fontSize:14, color:'#374151', cursor:'pointer'}}>
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      style={{flex:2, height:44, background:'#7C3AED', border:'none', borderRadius:10, fontSize:14, fontWeight:600, color:'white', cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                      {saving && <span style={{width:14, height:14, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
                      {saving ? 'Saving...' : 'Save Appointment'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
