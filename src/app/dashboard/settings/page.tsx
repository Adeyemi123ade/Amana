'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Section = null | 'business' | 'profile' | 'password' | 'notifications' | 'team'

const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 12px', borderRadius: 8,
  border: '1px solid #E5E7EB', fontSize: 14, color: '#111827',
  outline: 'none', boxSizing: 'border-box', background: 'white',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6,
}
const sectionTitle: React.CSSProperties = {
  fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4,
}
const sectionSub: React.CSSProperties = {
  fontSize: 13, color: '#6B7280', marginBottom: 20,
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [section, setSection] = useState<Section>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)

  // Profile form
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '', country: '' })
  // Business form
  const [business, setBusiness] = useState({ name: '', type: '', email: '', phone: '', address: '', website: '' })
  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')
  // Notifications
  const [notifs, setNotifs] = useState({ email: true, payment: true, appointment: true, invoice: true, weekly: true })
  // Team
  const [inviteEmail, setInviteEmail] = useState('')
  const [team, setTeam] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      setProfile({
        fullName: u?.user_metadata?.full_name || '',
        email: u?.email || '',
        phone: u?.user_metadata?.phone || '',
        country: u?.user_metadata?.country || '',
      })
      if (u) {
        const { data: ws } = await supabase.from('workspaces').select('*').eq('created_by', u.id).single()
        setWorkspace(ws)
        if (ws) {
          setBusiness({
            name: ws.name || '',
            type: ws.business_type || '',
            email: ws.business_email || '',
            phone: ws.whatsapp_number || '',
            address: ws.business_address || '',
            website: ws.website || '',
          })
        }
      }
    }
    load()
  }, [])

  const showMsg = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: profile.fullName, phone: profile.phone, country: profile.country }
    })
    setSaving(false)
    if (error) showMsg('Error: ' + error.message)
    else showMsg('Profile updated successfully')
  }

  const saveBusiness = async () => {
    if (!workspace) return
    setSaving(true)
    const { error } = await supabase.from('workspaces').update({
      name: business.name,
      business_type: business.type,
      business_email: business.email,
      whatsapp_number: business.phone,
      business_address: business.address,
      website: business.website,
    }).eq('id', workspace.id)
    setSaving(false)
    if (error) showMsg('Error: ' + error.message)
    else showMsg('Business profile updated successfully')
  }

  const savePassword = async () => {
    setPwdError('')
    if (passwords.newPwd !== passwords.confirm) { setPwdError('Passwords do not match'); return }
    if (passwords.newPwd.length < 8) { setPwdError('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(passwords.newPwd)) { setPwdError('Must include an uppercase letter'); return }
    if (!/[^A-Za-z0-9]/.test(passwords.newPwd)) { setPwdError('Must include a special character'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.newPwd })
    setSaving(false)
    if (error) setPwdError(error.message)
    else { showMsg('Password changed successfully'); setPasswords({ current: '', newPwd: '', confirm: '' }) }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const settingGroups = [
    {
      title: 'Business Settings',
      items: [
        { key: 'business', label: 'Business Profile', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { key: 'notifications', label: 'Notification Preferences', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { key: 'team', label: 'Team Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      ]
    },
    {
      title: 'Account Settings',
      items: [
        { key: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { key: 'password', label: 'Change Password', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
      ]
    }
  ]

  const backBtn = (
    <button onClick={() => setSection(null)} style={{display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#6B7280', fontSize:13, marginBottom:20, padding:0}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      Back to Settings
    </button>
  )

  const saveBtn = (onClick: () => void) => (
    <button onClick={onClick} disabled={saving} style={{height:44, padding:'0 24px', background:'#7C3AED', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', opacity:saving?0.7:1, display:'flex', alignItems:'center', gap:6}}>
      {saving && <span style={{width:14, height:14, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
      Save Changes
    </button>
  )

  // === BUSINESS PROFILE SECTION ===
  if (section === 'business') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={sectionTitle}>Business Profile</p>
      <p style={sectionSub}>Update your business information</p>
      {message && <div style={{background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#16A34A', marginBottom:16}}>{message}</div>}
      <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', padding:'24px', display:'flex', flexDirection:'column', gap:16}}>
        <div><label style={labelStyle}>Business Name</label><input style={inputStyle} value={business.name} onChange={e => setBusiness({...business, name:e.target.value})} /></div>
        <div><label style={labelStyle}>Business Type</label><input style={inputStyle} value={business.type} onChange={e => setBusiness({...business, type:e.target.value})} /></div>
        <div><label style={labelStyle}>Business Email</label><input type="email" style={inputStyle} value={business.email} onChange={e => setBusiness({...business, email:e.target.value})} /></div>
        <div><label style={labelStyle}>WhatsApp / Phone</label><input style={inputStyle} value={business.phone} onChange={e => setBusiness({...business, phone:e.target.value})} /></div>
        <div><label style={labelStyle}>Business Address</label><input style={inputStyle} value={business.address} onChange={e => setBusiness({...business, address:e.target.value})} /></div>
        <div><label style={labelStyle}>Website</label><input type="url" style={inputStyle} value={business.website} onChange={e => setBusiness({...business, website:e.target.value})} /></div>
        {saveBtn(saveBusiness)}
      </div>
    </div>
  )

  // === PROFILE SECTION ===
  if (section === 'profile') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={sectionTitle}>Profile</p>
      <p style={sectionSub}>Update your personal information</p>
      {message && <div style={{background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#16A34A', marginBottom:16}}>{message}</div>}
      <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', padding:'24px', display:'flex', flexDirection:'column', gap:16}}>
        <div><label style={labelStyle}>Full Name</label><input style={inputStyle} value={profile.fullName} onChange={e => setProfile({...profile, fullName:e.target.value})} /></div>
        <div><label style={labelStyle}>Email Address</label><input type="email" style={{...inputStyle, background:'#F9FAFB', color:'#6B7280'}} value={profile.email} readOnly /></div>
        <div><label style={labelStyle}>Phone Number</label><input style={inputStyle} value={profile.phone} onChange={e => setProfile({...profile, phone:e.target.value})} /></div>
        <div><label style={labelStyle}>Country</label><input style={inputStyle} value={profile.country} onChange={e => setProfile({...profile, country:e.target.value})} /></div>
        {saveBtn(saveProfile)}
      </div>
    </div>
  )

  // === CHANGE PASSWORD SECTION ===
  if (section === 'password') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={sectionTitle}>Change Password</p>
      <p style={sectionSub}>Choose a strong password for your account</p>
      {message && <div style={{background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#16A34A', marginBottom:16}}>{message}</div>}
      {pwdError && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16}}>{pwdError}</div>}
      <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', padding:'24px', display:'flex', flexDirection:'column', gap:16}}>
        <div><label style={labelStyle}>New Password</label><input type="password" style={inputStyle} value={passwords.newPwd} onChange={e => setPasswords({...passwords, newPwd:e.target.value})} placeholder="Min 8 characters" /></div>
        <div><label style={labelStyle}>Confirm New Password</label><input type="password" style={inputStyle} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm:e.target.value})} placeholder="Repeat new password" /></div>
        <div style={{background:'#F9FAFB', borderRadius:8, padding:'12px'}}>
          <p style={{fontSize:12, fontWeight:600, color:'#374151', marginBottom:6}}>Password requirements:</p>
          {[
            {label:'At least 8 characters', met: passwords.newPwd.length >= 8},
            {label:'At least one uppercase letter', met: /[A-Z]/.test(passwords.newPwd)},
            {label:'At least one lowercase letter', met: /[a-z]/.test(passwords.newPwd)},
            {label:'At least one special character', met: /[^A-Za-z0-9]/.test(passwords.newPwd)},
          ].map(r => (
            <div key={r.label} style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
              <span style={{color: r.met ? '#22C55E' : '#D1D5DB', fontSize:12}}>{r.met ? '✓' : '○'}</span>
              <span style={{fontSize:12, color: r.met ? '#374151' : '#9CA3AF'}}>{r.label}</span>
            </div>
          ))}
        </div>
        {saveBtn(savePassword)}
      </div>
    </div>
  )

  // === NOTIFICATIONS SECTION ===
  if (section === 'notifications') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={sectionTitle}>Notification Preferences</p>
      <p style={sectionSub}>Control which notifications you receive</p>
      {message && <div style={{background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#16A34A', marginBottom:16}}>{message}</div>}
      <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', overflow:'hidden'}}>
        {[
          {key:'email', label:'Email Notifications', desc:'Receive general email notifications'},
          {key:'payment', label:'Payment Reminders', desc:'Get notified when payments are due'},
          {key:'appointment', label:'Appointment Reminders', desc:'Get reminded before appointments'},
          {key:'invoice', label:'Invoice Reminders', desc:'Notifications for unpaid invoices'},
          {key:'weekly', label:'Weekly Summary', desc:'Weekly business summary every Monday'},
        ].map((n, i) => (
          <div key={n.key} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderTop: i > 0 ? '1px solid #F9FAFB' : 'none'}}>
            <div>
              <p style={{fontSize:14, fontWeight:500, color:'#111827', marginBottom:2}}>{n.label}</p>
              <p style={{fontSize:12, color:'#9CA3AF'}}>{n.desc}</p>
            </div>
            <button
              onClick={() => setNotifs(s => ({...s, [n.key]: !s[n.key as keyof typeof s]}))}
              style={{width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background:notifs[n.key as keyof typeof notifs]?'#7C3AED':'#E5E7EB', position:'relative', transition:'background 0.2s', flexShrink:0}}
            >
              <span style={{position:'absolute', top:2, left:notifs[n.key as keyof typeof notifs]?20:2, width:20, height:20, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', display:'block'}}/>
            </button>
          </div>
        ))}
        <div style={{padding:'16px 20px', borderTop:'1px solid #F3F4F6'}}>
          <button onClick={() => showMsg('Notification preferences saved')} style={{height:44, padding:'0 24px', background:'#7C3AED', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer'}}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )

  // === TEAM SECTION ===
  if (section === 'team') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={sectionTitle}>Team Members</p>
      <p style={sectionSub}>Invite and manage your team</p>
      {message && <div style={{background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#16A34A', marginBottom:16}}>{message}</div>}
      <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', padding:'20px', marginBottom:16}}>
        <p style={{fontSize:13, fontWeight:600, color:'#111827', marginBottom:12}}>Invite a team member</p>
        <div style={{display:'flex', gap:10}}>
          <input
            type="email"
            style={{...inputStyle, flex:1}}
            placeholder="colleague@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
          />
          <button
            onClick={() => { if (inviteEmail) { showMsg(`Invitation sent to ${inviteEmail}`); setInviteEmail('') } }}
            style={{height:44, padding:'0 18px', background:'#7C3AED', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', flexShrink:0}}
          >
            Invite
          </button>
        </div>
      </div>
      <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', padding:'20px'}}>
        <p style={{fontSize:13, fontWeight:600, color:'#111827', marginBottom:12}}>Current Team</p>
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px', background:'#F9FAFB', borderRadius:10}}>
          <div style={{width:36, height:36, borderRadius:'50%', background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#7C3AED'}}>
            {user?.user_metadata?.full_name?.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2) || 'ME'}
          </div>
          <div style={{flex:1}}>
            <p style={{fontSize:13, fontWeight:500, color:'#111827'}}>{user?.user_metadata?.full_name || user?.email}</p>
            <p style={{fontSize:11, color:'#9CA3AF'}}>{user?.email}</p>
          </div>
          <span style={{fontSize:11, fontWeight:600, color:'#7C3AED', background:'#EDE9FE', padding:'3px 8px', borderRadius:20}}>Owner</span>
        </div>
        {team.length === 0 && (
          <p style={{fontSize:13, color:'#9CA3AF', textAlign:'center', padding:'16px 0'}}>No team members yet. Invite someone above.</p>
        )}
      </div>
    </div>
  )

  // === MAIN SETTINGS LIST ===
  return (
    <div style={{maxWidth:520}}>
      <h1 style={{fontSize:22, fontWeight:700, color:'#111827', marginBottom:24}}>Settings</h1>

      {message && <div style={{background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#16A34A', marginBottom:16}}>{message}</div>}

      {settingGroups.map(group => (
        <div key={group.title} style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', overflow:'hidden', marginBottom:16}}>
          <div style={{padding:'14px 20px', borderBottom:'1px solid #F3F4F6', background:'#F9FAFB'}}>
            <p style={{fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.6}}>{group.title}</p>
          </div>
          {group.items.map((item, i) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key as Section)}
              style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px 20px', borderTop: i > 0 ? '1px solid #F9FAFB' : 'none', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}
            >
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:34, height:34, borderRadius:9, background:'#F5F3FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon}/>
                  </svg>
                </div>
                <span style={{fontSize:14, color:'#111827'}}>{item.label}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      ))}

      {/* Sign out */}
      <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', overflow:'hidden'}}>
        <button
          onClick={handleSignOut}
          style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'15px 20px', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}
        >
          <div style={{width:34, height:34, borderRadius:9, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </div>
          <span style={{fontSize:14, color:'#EF4444', fontWeight:500}}>Log out</span>
        </button>
      </div>
    </div>
  )
}
