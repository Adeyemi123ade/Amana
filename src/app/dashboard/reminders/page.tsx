'use client'

import { useState } from 'react'

const automations = [
  { key:'payment', label:'Payment Reminders', desc:'Send payment reminder 2 days before due date', default:true },
  { key:'appointment', label:'Appointment Reminders', desc:'Send reminder 24h and 1h before appointment', default:true },
  { key:'followup', label:'Follow-up Reminders', desc:'Follow up after signal of inactive customers', default:false },
  { key:'weekly', label:'Weekly Summary', desc:'Send weekly business summary every Monday', default:true },
]

export default function RemindersPage() {
  const [states, setStates] = useState<Record<string,boolean>>(
    Object.fromEntries(automations.map(a => [a.key, a.default]))
  )

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#111827'}}>Reminders / Automation</h1>
        <button style={{display:'flex',alignItems:'center',gap:6,background:'#7C3AED',color:'white',padding:'10px 18px',borderRadius:10,fontSize:14,fontWeight:600,border:'none',cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Automation
        </button>
      </div>
      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #F3F4F6'}}>
          <p style={{fontSize:14,fontWeight:600,color:'#111827'}}>Automation</p>
        </div>
        {automations.map((auto, i) => (
          <div key={auto.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderTop: i>0?'1px solid #F9FAFB':'none'}}>
            <div style={{flex:1,marginRight:16}}>
              <p style={{fontSize:14,fontWeight:500,color:'#111827',marginBottom:2}}>{auto.label}</p>
              <p style={{fontSize:12,color:'#9CA3AF'}}>{auto.desc}</p>
            </div>
            <button
              onClick={() => setStates(s => ({...s, [auto.key]: !s[auto.key]}))}
              style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',background:states[auto.key]?'#7C3AED':'#E5E7EB',position:'relative',transition:'background 0.2s',flexShrink:0}}
            >
              <span style={{position:'absolute',top:2,left:states[auto.key]?20:2,width:20,height:20,borderRadius:'50%',background:'white',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',display:'block'}}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
