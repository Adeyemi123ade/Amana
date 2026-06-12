'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const settingGroups = [
  {
    title: 'Business Settings',
    items: [
      { label:'Business Profile', icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { label:'Invoice Settings', icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { label:'Payment Methods', icon:'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { label:'Tax Settings', icon:'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
    ]
  },
  {
    title: 'Account Settings',
    items: [
      { label:'Profile', icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { label:'Change Password', icon:'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
      { label:'Team Members', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { label:'Notifications', icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ]
  }
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <div style={{maxWidth:520}}>
      <h1 style={{fontSize:22,fontWeight:700,color:'#111827',marginBottom:24}}>Settings</h1>
      {settingGroups.map(group => (
        <div key={group.title} style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',overflow:'hidden',marginBottom:16}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid #F3F4F6'}}>
            <p style={{fontSize:12,fontWeight:600,color:'#6B7280',textTransform:'uppercase',letterSpacing:0.5}}>{group.title}</p>
          </div>
          {group.items.map((item, i) => (
            <button key={item.label} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderTop:i>0?'1px solid #F9FAFB':'none',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:'#F5F3FF',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                </div>
                <span style={{fontSize:14,color:'#111827',fontWeight:400}}>{item.label}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      ))}
      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',overflow:'hidden'}}>
        <button onClick={handleSignOut} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'14px 20px',background:'none',border:'none',cursor:'pointer'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          <span style={{fontSize:14,color:'#EF4444',fontWeight:500}}>Log out</span>
        </button>
      </div>
    </div>
  )
}
