'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/utils'

const inp: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white' }
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function AppointmentsPage() {
  const supabase = createClient()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(now.getDate())
  const [appointments, setAppointments] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ customerId:'', title:'', date:'', time:'', duration:'60', location:'', notes:'', status:'CONFIRMED' })

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: ws } = await supabase.from('workspaces').select('id').eq('created_by', user?.id).single()
    setWorkspace(ws)
    if (ws) {
      const { data: appts } = await supabase.from('appointments').select('*, customers(name)').eq('workspace_id', ws.id).order('start_time', { ascending: true })
      setAppointments(appts || [])
      const { data: custs } = await supabase.from('customers').select('id,name').eq('workspace_id', ws.id)
      setCustomers(custs || [])
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
    if (!form.title.trim()) { setError('Appointment title is required'); return }
    if (!form.date) { setError('Please select a date'); return }
    if (!form.time) { setError('Please select a time'); return }
    setSaving(true); setError('')
    try {
      const startTime = new Date(`${form.date}T${form.time}:00`)
      const endTime = new Date(startTime.getTime() + parseInt(form.duration) * 60000)
      const { error: err } = await supabase.from('appointments').insert({
        workspace_id: workspace.id,
        customer_id: form.customerId || null,
        title: form.title.trim(),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
        status: form.status,
      })
      if (err) throw err
      setForm({ customerId:'', title:'', date:'', time:'', duration:'60', location:'', notes:'', status:'CONFIRMED' })
      setShowModal(false)
      await load()
    } catch (e: any) {
      setError(e.message || 'Could not save appointment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
        <h1 style={{fontSize:22, fontWeight:700, color:'var(--text)'}}>Appointments</h1>
        <button onClick={() => { setShowModal(true); setError(''); setForm(f => ({...f, date: selectedDateStr})) }}
          style={{display:'flex', alignItems:'center', gap:6, background:'var(--accent)', color:'white', padding:'10px 18px', borderRadius:10, fontSize:14, fontWeight:600, border:'none', cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Appointment
        </button>
      </div>

      <div className="three-col-grid">
        {/* Calendar */}
        <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'20px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
            <button onClick={prevMonth} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px 8px', borderRadius:6, fontSize:18}}>‹</button>
            <p style={{fontSize:14, fontWeight:600, color:'var(--text)'}}>{MONTH_NAMES[month]} {year}</p>
            <button onClick={nextMonth} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px 8px', borderRadius:6, fontSize:18}}>›</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6}}>
            {DAY_NAMES.map(d => <div key={d} style={{textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)', padding:'4px 0', textTransform:'uppercase'}}>{d}</div>)}
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2}}>
            {Array.from({length: firstDay}).map((_, i) => <div key={`e${i}`}/>)}
            {Array.from({length: daysInMonth}).map((_, i) => {
              const day = i + 1
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
              const isSelected = day === selectedDay
              const hasAppt = apptDays.has(day)
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  style={{textAlign:'center', padding:'7px 0', borderRadius:8, fontSize:13, border:'none', cursor:'pointer',
                    fontWeight: isSelected || isToday ? 700 : 400,
                    color: isSelected ? 'white' : isToday ? 'var(--accent)' : 'var(--text)',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    position:'relative'}}>
                  {day}
                  {hasAppt && !isSelected && <span style={{position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'var(--accent)', display:'block'}}/>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Schedule for selected day */}
        <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column'}}>
          <p style={{fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:14}}>
            {new Date(year, month, selectedDay).toLocaleDateString('en-NG', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
          </p>
          <div style={{flex:1}}>
            {selectedAppts.length === 0 ? (
              <div style={{textAlign:'center', padding:'32px 0'}}>
                <div style={{fontSize:36, marginBottom:8}}>📅</div>
                <p style={{fontSize:14, color:'var(--text-muted)'}}>No appointments this day</p>
                <p style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>Click New Appointment above to add one</p>
              </div>
            ) : selectedAppts.map((a: any) => (
              <div key={a.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:10, background:'var(--bg-secondary)', marginBottom:8}}>
                <span style={{fontSize:12, fontWeight:600, color:'var(--text-muted)', minWidth:60, flexShrink:0}}>{formatTime(a.start_time)}</span>
                <div style={{flex:1, minWidth:0}}>
                  <p style={{fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.customers?.name || 'No customer'}</p>
                  <p style={{fontSize:12, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.title}</p>
                </div>
                <span style={{fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, flexShrink:0,
                  color: a.status==='CONFIRMED'?'#22C55E':'#F59E0B',
                  background: a.status==='CONFIRMED'?'#F0FDF4':'#FFFBEB'}}>
                  {a.status==='CONFIRMED'?'Confirmed':'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
          <div style={{background:'white', borderRadius:16, padding:'24px', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h2 style={{fontSize:18, fontWeight:700, color:'#111827'}}>New Appointment</h2>
              <button onClick={() => setShowModal(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:22, lineHeight:1}}>×</button>
            </div>
            {error && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:14}}>{error}</div>}
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div>
                <label style={lbl}>Customer</label>
                <select value={form.customerId} onChange={e => setForm({...form, customerId:e.target.value})} style={inp}>
                  <option value="">Select customer (optional)</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Appointment Title <span style={{color:'#EF4444'}}>*</span></label>
                <input style={inp} placeholder="e.g. Consultation, Hair Session" value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
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
                <input style={inp} placeholder="e.g. Online, Office, Client site" value={form.location} onChange={e => setForm({...form, location:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Notes</label>
                <textarea style={{...inp, height:70, paddingTop:10, resize:'none'}} placeholder="Any notes..." value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
              </div>
              <div style={{display:'flex', gap:10}}>
                <button onClick={() => setShowModal(false)} style={{flex:1, height:44, background:'white', border:'1px solid #E5E7EB', borderRadius:10, fontSize:14, color:'#374151', cursor:'pointer'}}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{flex:2, height:44, background:'#7C3AED', border:'none', borderRadius:10, fontSize:14, fontWeight:600, color:'white', cursor:'pointer', opacity:saving?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                  {saving && <span style={{width:14, height:14, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
                  Save Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
