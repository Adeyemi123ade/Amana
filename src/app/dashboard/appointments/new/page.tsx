'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const inp: React.CSSProperties = {
  width:'100%',height:46,padding:'0 14px',borderRadius:10,
  border:'1.5px solid var(--border-light)',fontSize:14,
  color:'var(--text)',background:'var(--bg-secondary)',
  outline:'none',boxSizing:'border-box',fontFamily:'inherit'
}
const lbl: React.CSSProperties = {
  display:'block',fontSize:12,fontWeight:600,
  color:'var(--text-muted)',marginBottom:6,
  textTransform:'uppercase',letterSpacing:.4
}
const card: React.CSSProperties = {
  background:'var(--card)',borderRadius:14,
  border:'1px solid var(--border)',padding:'20px',marginBottom:14
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const [ws, setWs]             = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  // Customer mode
  const [custMode, setCustMode] = useState<'existing'|'new'>('existing')
  const [custId, setCustId]     = useState('')
  const [newCust, setNewCust]   = useState({ name:'', email:'', phone:'' })

  // Appointment fields
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    locationType: 'ONLINE',
    meetingLink: '',
    connectionDetails: '',
    physicalAddress: '',
    notes: '',
    duration: '60',
  })

  const f = (k: string, v: string) => setForm(p => ({...p, [k]:v}))

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }
      const { data: workspace } = await supabase
        .from('workspaces').select('*').eq('created_by', user.id).maybeSingle()
      if (!workspace) { setError('Workspace not found.'); setLoading(false); return }
      setWs(workspace)
      const { data: custs } = await supabase
        .from('customers').select('id,name,email,phone').eq('workspace_id', workspace.id).order('name')
      setCustomers(custs || [])
      // Pre-select customer from URL param
      const param = new URLSearchParams(window.location.search).get('customer')
      if (param) { setCustId(param); setCustMode('existing') }
      setLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async () => {
    setError('')
    if (!form.title.trim()) { setError('Please enter an appointment title'); return }
    if (!form.date)          { setError('Please select a date'); return }
    if (!form.time)          { setError('Please select a time'); return }
    if (custMode === 'existing' && !custId) { setError('Please select a customer'); return }
    if (custMode === 'new' && !newCust.name.trim()) { setError('Please enter the customer name'); return }

    setSaving(true)
    let finalCustId = custId

    // Create new customer if needed
    if (custMode === 'new') {
      const { data: created, error: custErr } = await supabase
        .from('customers')
        .insert({ workspace_id: ws.id, name: newCust.name.trim(), email: newCust.email.trim()||null, phone: newCust.phone.trim()||null })
        .select('id').single()
      if (custErr || !created) {
        setError('Could not save new customer: ' + (custErr?.message||''))
        setSaving(false); return
      }
      finalCustId = created.id
    }

    const startTime = new Date(`${form.date}T${form.time}:00`).toISOString()
    const endTime   = new Date(new Date(startTime).getTime() + parseInt(form.duration)*60000).toISOString()

    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        workspace_id:     ws.id,
        customer_id:      finalCustId,
        title:            form.title.trim(),
        start_time:       startTime,
        end_time:         endTime,
        location_type:    form.locationType,
        location:         form.locationType === 'PHYSICAL' ? form.physicalAddress.trim()||null : form.meetingLink.trim()||null,
        notes:            form.notes.trim()||null,
        status:           'PENDING',
      })
      .select('id').single()

    setSaving(false)
    if (apptErr || !appt) { setError(apptErr?.message || 'Could not create appointment'); return }
    router.push(`/dashboard/appointments/${appt.id}`)
  }

  const minDate = new Date(); minDate.setDate(minDate.getDate())
  const minDateStr = minDate.toISOString().split('T')[0]

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{width:28,height:28,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{maxWidth:580}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={() => router.push('/dashboard/appointments')}
          style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,padding:'8px 14px'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <h1 style={{fontSize:20,fontWeight:700,color:'var(--text)'}}>New Appointment</h1>
      </div>

      {error && (
        <div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#DC2626'}}>
          {error}
        </div>
      )}

      {/* Customer */}
      <div style={card}>
        <p style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>Customer</p>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {(['existing','new'] as const).map(m => (
            <button key={m} onClick={() => setCustMode(m)}
              style={{flex:1,height:38,borderRadius:9,border:`2px solid ${custMode===m?'var(--accent)':'var(--border-light)'}`,background:custMode===m?'var(--accent)':'var(--bg-secondary)',color:custMode===m?'white':'var(--text-muted)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
              {m === 'existing' ? 'Select Existing' : 'Add New Customer'}
            </button>
          ))}
        </div>

        {custMode === 'existing' ? (
          <div>
            <label style={lbl}>Select Customer *</label>
            <select style={{...inp}} value={custId} onChange={e => setCustId(e.target.value)}>
              <option value="">Choose a customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.email ? ` — ${c.email}` : ''}</option>)}
            </select>
            {custId && (() => {
              const c = customers.find(x => x.id === custId)
              return c ? (
                <div style={{marginTop:10,padding:'10px 12px',background:'var(--bg-secondary)',borderRadius:9,border:'1px solid var(--border-light)'}}>
                  <p style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{c.name}</p>
                  {c.email && <p style={{fontSize:12,color:'var(--text-muted)'}}>{c.email}</p>}
                  {c.phone && <p style={{fontSize:12,color:'var(--text-muted)'}}>{c.phone}</p>}
                </div>
              ) : null
            })()}
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={lbl}>Full Name *</label>
              <input style={inp} placeholder="Customer name" value={newCust.name} onChange={e => setNewCust(p=>({...p,name:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input type="email" style={inp} placeholder="customer@email.com" value={newCust.email} onChange={e => setNewCust(p=>({...p,email:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>Phone Number</label>
              <input type="tel" style={inp} placeholder="+234 800 000 0000" value={newCust.phone} onChange={e => setNewCust(p=>({...p,phone:e.target.value}))}/>
            </div>
          </div>
        )}
      </div>

      {/* Appointment details */}
      <div style={card}>
        <p style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>Appointment Details</p>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={lbl}>Title / Meeting Purpose *</label>
            <input style={inp} placeholder="e.g. Initial Consultation, Follow-up Session" value={form.title} onChange={e => f('title',e.target.value)}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              <label style={lbl}>Date *</label>
              <input type="date" style={inp} min={minDateStr} value={form.date} onChange={e => f('date',e.target.value)}/>
            </div>
            <div>
              <label style={lbl}>Time *</label>
              <input type="time" style={inp} value={form.time} onChange={e => f('time',e.target.value)}/>
            </div>
          </div>
          <div>
            <label style={lbl}>Duration</label>
            <select style={inp} value={form.duration} onChange={e => f('duration',e.target.value)}>
              {[['30','30 minutes'],['45','45 minutes'],['60','1 hour'],['90','1.5 hours'],['120','2 hours']].map(([v,l]) =>
                <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

        </div>
      </div>

      {/* Location */}
      <div style={card}>
        <p style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>Location</p>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {[['ONLINE','💻 Virtual'],['PHYSICAL','📍 Physical']] .map(([v,l]) => (
            <button key={v} onClick={() => f('locationType',v)}
              style={{flex:1,height:42,borderRadius:9,border:`2px solid ${form.locationType===v?'var(--accent)':'var(--border-light)'}`,background:form.locationType===v?'var(--accent)':'var(--bg-secondary)',color:form.locationType===v?'white':'var(--text-muted)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>

        {form.locationType === 'ONLINE' ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <p style={{fontSize:12,color:'var(--text-muted)'}}>Where should the customer connect?</p>
            <div>
              <label style={lbl}>Meeting Link</label>
              <input style={inp} placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={e => f('meetingLink',e.target.value)}/>
            </div>
            <div>
              <label style={lbl}>Phone / Connection Details</label>
              <input style={inp} placeholder="Phone number or joining instructions" value={form.connectionDetails} onChange={e => f('connectionDetails',e.target.value)}/>
            </div>
          </div>
        ) : (
          <div>
            <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:10}}>Where should the customer go?</p>
            <label style={lbl}>Full Address</label>
            <textarea style={{...inp,height:72,paddingTop:12,resize:'none'} as any}
              placeholder="Street address, City, State" value={form.physicalAddress} onChange={e => f('physicalAddress',e.target.value)}/>
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={card}>
        <label style={lbl}>Notes / Description</label>
        <textarea style={{...inp,height:80,paddingTop:12,resize:'none'} as any}
          placeholder="Any additional notes or preparation instructions..." value={form.notes} onChange={e => f('notes',e.target.value)}/>
      </div>

      {/* Actions */}
      <div style={{display:'flex',gap:10,paddingBottom:32}}>
        <button onClick={() => router.push('/dashboard/appointments')}
          style={{flex:1,height:48,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:12,fontSize:14,fontWeight:500,color:'var(--text-muted)',cursor:'pointer'}}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving}
          style={{flex:2,height:48,background:'var(--accent)',color:'white',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:saving?'not-allowed':'pointer',opacity:saving?.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {saving ? <><span style={{width:16,height:16,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/>Creating...</> : '📅 Create Appointment'}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
