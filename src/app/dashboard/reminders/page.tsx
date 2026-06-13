'use client'

import { useState } from 'react'

const DEFAULT_AUTOMATIONS = [
  { key:'payment', label:'Payment Reminders', desc:'Send payment reminder 2 days before due date', enabled:true },
  { key:'appointment', label:'Appointment Reminders', desc:'Send reminder 24h and 1h before appointment', enabled:true },
  { key:'followup', label:'Follow-up Reminders', desc:'Follow up with inactive customers automatically', enabled:false },
  { key:'weekly', label:'Weekly Summary', desc:'Send weekly business summary every Monday', enabled:true },
  { key:'overdue', label:'Overdue Invoice Alerts', desc:'Alert when invoice is more than 7 days overdue', enabled:true },
  { key:'birthday', label:'Customer Birthday Messages', desc:'Send a message on customer birthdays', enabled:false },
]

const inp: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white' }
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }

export default function RemindersPage() {
  const [automations, setAutomations] = useState(DEFAULT_AUTOMATIONS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ label:'', desc:'', trigger:'', timing:'' })
  const [saving, setSaving] = useState(false)

  const toggle = (key: string) => {
    setAutomations(prev => prev.map(a => a.key === key ? {...a, enabled: !a.enabled} : a))
  }

  const handleAdd = async () => {
    if (!form.label.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setAutomations(prev => [...prev, {
      key: `custom_${Date.now()}`,
      label: form.label.trim(),
      desc: form.desc.trim() || 'Custom automation rule',
      enabled: true,
    }])
    setForm({ label:'', desc:'', trigger:'', timing:'' })
    setShowModal(false)
    setSaving(false)
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
        <h1 style={{fontSize:22, fontWeight:700, color:'var(--text)'}}>Reminders & Automation</h1>
        <button onClick={() => setShowModal(true)}
          style={{display:'flex', alignItems:'center', gap:6, background:'var(--accent)', color:'white', padding:'10px 18px', borderRadius:10, fontSize:14, fontWeight:600, border:'none', cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Automation
        </button>
      </div>

      {/* Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12, marginBottom:20}}>
        {[
          {label:'Active Rules', value:String(automations.filter(a => a.enabled).length), color:'#22C55E'},
          {label:'Total Rules', value:String(automations.length), color:'var(--accent)'},
          {label:'Reminders Sent', value:'0', color:'#F59E0B'},
        ].map(s => (
          <div key={s.label} style={{background:'var(--card)', borderRadius:12, padding:'16px', border:'1px solid var(--border)'}}>
            <p style={{fontSize:11, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.3}}>{s.label}</p>
            <p style={{fontSize:24, fontWeight:800, color:s.color}}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Automation list */}
      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden'}}>
        <div style={{padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)'}}>
          <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5}}>Automation Rules</p>
        </div>
        {automations.map((auto, i) => (
          <div key={auto.key} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderTop: i>0 ? '1px solid var(--border)' : 'none'}}>
            <div style={{flex:1, marginRight:16}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:2}}>
                <p style={{fontSize:14, fontWeight:500, color:'var(--text)'}}>{auto.label}</p>
                {auto.enabled && <span style={{fontSize:10, fontWeight:700, color:'#22C55E', background:'#F0FDF4', padding:'2px 6px', borderRadius:10}}>ACTIVE</span>}
              </div>
              <p style={{fontSize:12, color:'var(--text-muted)'}}>{auto.desc}</p>
            </div>
            <button onClick={() => toggle(auto.key)}
              style={{width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background:auto.enabled?'var(--accent)':'#E5E7EB', position:'relative', transition:'background 0.2s', flexShrink:0}}>
              <span style={{position:'absolute', top:2, left:auto.enabled?20:2, width:20, height:20, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', display:'block'}}/>
            </button>
          </div>
        ))}
      </div>

      {/* New Automation Modal */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
          <div style={{background:'white', borderRadius:16, padding:'24px', width:'100%', maxWidth:440}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h2 style={{fontSize:18, fontWeight:700, color:'#111827'}}>New Automation Rule</h2>
              <button onClick={() => setShowModal(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:22}}>×</button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div>
                <label style={lbl}>Rule Name <span style={{color:'#EF4444'}}>*</span></label>
                <input style={inp} placeholder="e.g. 3-Day Payment Reminder" value={form.label} onChange={e => setForm({...form, label:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Description</label>
                <input style={inp} placeholder="What does this automation do?" value={form.desc} onChange={e => setForm({...form, desc:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Trigger</label>
                <select value={form.trigger} onChange={e => setForm({...form, trigger:e.target.value})} style={inp}>
                  <option value="">Select trigger event</option>
                  <option value="invoice_due">Invoice due date approaching</option>
                  <option value="invoice_overdue">Invoice becomes overdue</option>
                  <option value="appointment_upcoming">Appointment upcoming</option>
                  <option value="customer_inactive">Customer inactive</option>
                  <option value="payment_received">Payment received</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Timing</label>
                <select value={form.timing} onChange={e => setForm({...form, timing:e.target.value})} style={inp}>
                  <option value="">Select timing</option>
                  <option value="1h">1 hour before</option>
                  <option value="24h">24 hours before</option>
                  <option value="2d">2 days before</option>
                  <option value="7d">7 days before</option>
                  <option value="immediate">Immediately</option>
                </select>
              </div>
              <div style={{display:'flex', gap:10, marginTop:4}}>
                <button onClick={() => setShowModal(false)} style={{flex:1, height:44, background:'white', border:'1px solid #E5E7EB', borderRadius:10, fontSize:14, color:'#374151', cursor:'pointer'}}>Cancel</button>
                <button onClick={handleAdd} disabled={saving || !form.label.trim()} style={{flex:2, height:44, background:'#7C3AED', border:'none', borderRadius:10, fontSize:14, fontWeight:600, color:'white', cursor:'pointer', opacity:!form.label.trim()?0.5:1}}>
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
