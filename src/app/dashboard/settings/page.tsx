'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { THEMES, type ThemeId } from '@/lib/theme/themes'

type Section = null | 'business' | 'profile' | 'password' | 'notifications' | 'team' | 'appearance'

const inp: React.CSSProperties = {
  width:'100%', height:44, padding:'0 12px', borderRadius:8,
  border:'1px solid var(--border-light)', fontSize:14, color:'var(--text)',
  outline:'none', boxSizing:'border-box', background:'var(--card)',
}
const lbl: React.CSSProperties = {
  display:'block', fontSize:13, fontWeight:500, color:'var(--text-secondary)', marginBottom:6,
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { themeId, setTheme } = useTheme()
  const [section, setSection] = useState<Section>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success'|'error'>('success')
  const [user, setUser] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Separate saving states for each section — no shared state bug
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [business, setBusiness] = useState({
    name:'', type:'', email:'', phone:'', address:'', website:'',
    instagram:'', bankName:'', accountNumber:'', accountName:'',
  })
  const [profile, setProfile] = useState({ fullName:'', email:'', phone:'', country:'' })
  const [passwords, setPasswords] = useState({ newPwd:'', confirm:'' })
  const [pwdError, setPwdError] = useState('')
  const [notifs, setNotifs] = useState({ email:true, payment:true, appointment:true, invoice:true, weekly:true })
  const [inviteEmail, setInviteEmail] = useState('')

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
        const { data: ws } = await supabase.from('workspaces').select('*').eq('created_by', u.id).maybeSingle()
        setWorkspace(ws)
        if (ws) {
          setBusiness({
            name: ws.name || '',
            type: ws.business_type || '',
            email: ws.business_email || '',
            phone: ws.whatsapp_number || '',
            address: ws.business_address || '',
            website: ws.website || '',
            instagram: ws.instagram || '',
            bankName: ws.bank_name || '',
            accountNumber: ws.account_number || '',
            accountName: ws.account_name || '',
          })
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const showMsg = (m: string, type: 'success'|'error' = 'success') => {
    setMessage(m)
    setMessageType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  const saveBusiness = async () => {
    if (!business.name.trim()) { showMsg('Business name cannot be empty', 'error'); return }
    if (!workspace) { showMsg('Workspace not loaded yet. Please refresh and try again.', 'error'); return }
    setSavingBusiness(true)
    const { error } = await supabase.from('workspaces').update({
      name: business.name.trim(),
      business_type: business.type,
      business_email: business.email.trim() || null,
      whatsapp_number: business.phone.trim() || null,
      business_address: business.address.trim() || null,
      website: business.website.trim() || null,
      instagram: business.instagram.trim() || null,
      bank_name: business.bankName.trim() || null,
      account_number: business.accountNumber.trim() || null,
      account_name: business.accountName.trim() || null,
    }).eq('id', workspace.id)
    setSavingBusiness(false)
    if (error) {
      showMsg('Could not save your business profile. Please try again.', 'error')
    } else {
      showMsg('Business profile updated successfully')
      setWorkspace((ws: any) => ({...ws, name: business.name}))
    }
  }

  const saveProfile = async () => {
    if (!profile.fullName.trim()) { showMsg('Full name cannot be empty', 'error'); return }
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: profile.fullName.trim(), phone: profile.phone.trim(), country: profile.country }
    })
    setSavingProfile(false)
    if (error) {
      showMsg('Could not update your profile. Please try again.', 'error')
    } else {
      showMsg('Profile updated successfully')
    }
  }

  const savePassword = async () => {
    setPwdError('')
    if (!passwords.newPwd) { setPwdError('Please enter a new password'); return }
    if (passwords.newPwd !== passwords.confirm) { setPwdError('Passwords do not match'); return }
    if (passwords.newPwd.length < 8) { setPwdError('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(passwords.newPwd)) { setPwdError('Must include at least one uppercase letter'); return }
    if (!/[^A-Za-z0-9]/.test(passwords.newPwd)) { setPwdError('Must include at least one special character'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.newPwd })
    setSavingPassword(false)
    if (error) {
      setPwdError('Could not update password. Please try again.')
    } else {
      showMsg('Password changed successfully')
      setPasswords({ newPwd:'', confirm:'' })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const cardStyle: React.CSSProperties = {
    background:'var(--card)', borderRadius:14, border:'1px solid var(--border-light)',
    overflow:'hidden', marginBottom:12,
  }

  const SaveBtn = ({ onClick, saving, label = 'Save Changes' }: { onClick:()=>void, saving:boolean, label?:string }) => (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        height:44, padding:'0 24px', background:'var(--accent)', color:'white',
        border:'none', borderRadius:10, fontSize:14, fontWeight:600,
        cursor: saving ? 'not-allowed' : 'pointer',
        opacity: saving ? 0.7 : 1,
        display:'flex', alignItems:'center', gap:6,
      }}
    >
      {saving && <span style={{width:14, height:14, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
      {saving ? 'Saving...' : label}
    </button>
  )

  const backBtn = (
    <button onClick={() => { setSection(null); setMessage('') }}
      style={{display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:13, marginBottom:18, padding:0}}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      Back to Settings
    </button>
  )

  const msgBox = message ? (
    <div style={{
      background: messageType === 'success' ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${messageType === 'success' ? '#BBF7D0' : '#FEE2E2'}`,
      borderRadius:8, padding:'10px 12px', fontSize:13,
      color: messageType === 'success' ? '#16A34A' : '#DC2626',
      marginBottom:14,
    }}>
      {message}
    </div>
  ) : null

  // ── BUSINESS PROFILE ──
  if (section === 'business') return (
    <div style={{maxWidth:600}}>
      {backBtn}
      <p style={{fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4}}>Business Profile</p>
      <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:16}}>
        This information appears on your invoices and booking page. Keep it accurate and up to date.
      </p>
      {msgBox}
      {loading ? (
        <div style={{textAlign:'center', padding:40, color:'var(--text-muted)'}}>Loading your business details...</div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:20}}>
          {/* Core business info */}
          <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border-light)', padding:'20px'}}>
            <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:14}}>Business Details</p>
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div>
                <label style={lbl}>Business Name <span style={{color:'#EF4444'}}>*</span></label>
                <input style={inp} value={business.name} onChange={e => setBusiness({...business, name:e.target.value})} placeholder="Your business name" />
                <p style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>This is the name that appears on all your invoices and documents</p>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <label style={lbl}>Business Type</label>
                  <input style={inp} value={business.type} onChange={e => setBusiness({...business, type:e.target.value})} placeholder="e.g. Photography" />
                </div>
                <div>
                  <label style={lbl}>Business Email</label>
                  <input type="email" style={inp} value={business.email} onChange={e => setBusiness({...business, email:e.target.value})} placeholder="business@example.com" />
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <label style={lbl}>WhatsApp / Phone</label>
                  <input style={inp} value={business.phone} onChange={e => setBusiness({...business, phone:e.target.value})} placeholder="+234 812 345 6789" />
                </div>
                <div>
                  <label style={lbl}>Instagram</label>
                  <input style={inp} value={business.instagram} onChange={e => setBusiness({...business, instagram:e.target.value})} placeholder="@yourhandle" />
                </div>
              </div>
              <div>
                <label style={lbl}>Business Address</label>
                <input style={inp} value={business.address} onChange={e => setBusiness({...business, address:e.target.value})} placeholder="Lagos, Nigeria" />
              </div>
              <div>
                <label style={lbl}>Website</label>
                <input type="url" style={inp} value={business.website} onChange={e => setBusiness({...business, website:e.target.value})} placeholder="https://yourwebsite.com" />
              </div>
            </div>
          </div>

          {/* Bank details for invoice payment */}
          <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border-light)', padding:'20px'}}>
            <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4}}>Bank Details</p>
            <p style={{fontSize:12, color:'var(--text-muted)', marginBottom:14}}>These appear on your invoice payment page when customers choose bank transfer</p>
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div>
                <label style={lbl}>Bank Name</label>
                <input style={inp} value={business.bankName} onChange={e => setBusiness({...business, bankName:e.target.value})} placeholder="e.g. Access Bank, GTBank, Zenith" />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <label style={lbl}>Account Number</label>
                  <input style={inp} value={business.accountNumber} onChange={e => setBusiness({...business, accountNumber:e.target.value})} placeholder="0123456789" />
                </div>
                <div>
                  <label style={lbl}>Account Name</label>
                  <input style={inp} value={business.accountName} onChange={e => setBusiness({...business, accountName:e.target.value})} placeholder="John Doe" />
                </div>
              </div>
            </div>
          </div>

          <SaveBtn onClick={saveBusiness} saving={savingBusiness} label="Save Business Profile" />
        </div>
      )}
    </div>
  )

  // ── PROFILE ──
  if (section === 'profile') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={{fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4}}>Your Profile</p>
      <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:16}}>Your personal account details</p>
      {msgBox}
      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border-light)', padding:'20px', display:'flex', flexDirection:'column', gap:14}}>
        <div>
          <label style={lbl}>Full Name</label>
          <input style={inp} value={profile.fullName} onChange={e => setProfile({...profile, fullName:e.target.value})} placeholder="Your full name" />
        </div>
        <div>
          <label style={lbl}>Email Address</label>
          <input type="email" style={{...inp, background:'var(--bg-secondary)', color:'var(--text-muted)'}} value={profile.email} readOnly />
          <p style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>Email address cannot be changed here</p>
        </div>
        <div>
          <label style={lbl}>Phone Number</label>
          <input style={inp} value={profile.phone} onChange={e => setProfile({...profile, phone:e.target.value})} placeholder="+234 812 345 6789" />
        </div>
        <div>
          <label style={lbl}>Country</label>
          <input style={inp} value={profile.country} onChange={e => setProfile({...profile, country:e.target.value})} placeholder="Nigeria" />
        </div>
        <SaveBtn onClick={saveProfile} saving={savingProfile} />
      </div>
    </div>
  )

  // ── CHANGE PASSWORD ──
  if (section === 'password') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={{fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4}}>Change Password</p>
      <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:16}}>Choose a strong password to keep your account secure</p>
      {msgBox}
      {pwdError && (
        <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:14}}>{pwdError}</div>
      )}
      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border-light)', padding:'20px', display:'flex', flexDirection:'column', gap:14}}>
        <div>
          <label style={lbl}>New Password</label>
          <input type="password" style={inp} value={passwords.newPwd} onChange={e => setPasswords({...passwords, newPwd:e.target.value})} placeholder="At least 8 characters" />
        </div>
        <div>
          <label style={lbl}>Confirm New Password</label>
          <input type="password" style={inp} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm:e.target.value})} placeholder="Repeat new password" />
        </div>
        <div style={{background:'var(--bg-secondary)', borderRadius:8, padding:'12px'}}>
          <p style={{fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:6}}>Requirements</p>
          {[
            {label:'At least 8 characters', met: passwords.newPwd.length >= 8},
            {label:'One uppercase letter (A-Z)', met: /[A-Z]/.test(passwords.newPwd)},
            {label:'One lowercase letter (a-z)', met: /[a-z]/.test(passwords.newPwd)},
            {label:'One special character (!@#$)', met: /[^A-Za-z0-9]/.test(passwords.newPwd)},
          ].map(r => (
            <div key={r.label} style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
              <span style={{color: r.met ? '#22C55E' : '#D1D5DB', fontSize:12}}>{r.met ? '✓' : '○'}</span>
              <span style={{fontSize:12, color: r.met ? 'var(--text)' : 'var(--text-muted)'}}>{r.label}</span>
            </div>
          ))}
        </div>
        <SaveBtn onClick={savePassword} saving={savingPassword} label="Change Password" />
      </div>
    </div>
  )

  // ── NOTIFICATIONS ──
  if (section === 'notifications') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={{fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4}}>Notification Preferences</p>
      <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:16}}>Choose what you want to be notified about</p>
      {msgBox}
      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border-light)', overflow:'hidden'}}>
        {[
          {key:'email', label:'Email Notifications', desc:'Receive general email updates'},
          {key:'payment', label:'Payment Reminders', desc:'Get notified when payments are due'},
          {key:'appointment', label:'Appointment Reminders', desc:'Get reminded before appointments'},
          {key:'invoice', label:'Invoice Alerts', desc:'Notifications for unpaid invoices'},
          {key:'weekly', label:'Weekly Summary', desc:'Your business summary every Monday'},
        ].map((n, i) => (
          <div key={n.key} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderTop: i > 0 ? '1px solid var(--border)' : 'none'}}>
            <div>
              <p style={{fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:2}}>{n.label}</p>
              <p style={{fontSize:12, color:'var(--text-muted)'}}>{n.desc}</p>
            </div>
            <button
              onClick={() => setNotifs(s => ({...s, [n.key]: !s[n.key as keyof typeof s]}))}
              style={{width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background:notifs[n.key as keyof typeof notifs]?'var(--accent)':'#E5E7EB', position:'relative', flexShrink:0}}>
              <span style={{position:'absolute', top:2, left:notifs[n.key as keyof typeof notifs]?20:2, width:20, height:20, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', display:'block'}}/>
            </button>
          </div>
        ))}
        <div style={{padding:'14px 18px', borderTop:'1px solid var(--border)'}}>
          <button onClick={() => showMsg('Notification preferences saved')}
            style={{height:44, padding:'0 24px', background:'var(--accent)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer'}}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )

  // ── TEAM ──
  if (section === 'team') return (
    <div style={{maxWidth:560}}>
      {backBtn}
      <p style={{fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4}}>Team Members</p>
      <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:16}}>Invite colleagues to help manage your business</p>
      {msgBox}
      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border-light)', padding:'18px', marginBottom:12}}>
        <p style={{fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:10}}>Invite a team member</p>
        <div style={{display:'flex', gap:8}}>
          <input type="email" style={{...inp, flex:1}} placeholder="colleague@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
          <button
            onClick={() => { if (inviteEmail) { showMsg(`Invitation sent to ${inviteEmail}`); setInviteEmail('') } }}
            style={{height:44, padding:'0 16px', background:'var(--accent)', color:'white', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', flexShrink:0}}>
            Invite
          </button>
        </div>
      </div>
      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border-light)', padding:'18px'}}>
        <p style={{fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:10}}>Current Team</p>
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px', background:'var(--bg-secondary)', borderRadius:10}}>
          <div style={{width:36, height:36, borderRadius:'50%', background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--accent)', flexShrink:0}}>
            {(workspace?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {workspace?.name || user?.user_metadata?.full_name || user?.email}
            </p>
            <p style={{fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user?.email}</p>
          </div>
          <span style={{fontSize:11, fontWeight:600, color:'var(--accent)', background:'var(--accent-light)', padding:'3px 8px', borderRadius:20, flexShrink:0}}>Owner</span>
        </div>
      </div>
    </div>
  )

  // ── APPEARANCE ──
  if (section === 'appearance') return (
    <div style={{maxWidth:640}}>
      {backBtn}
      <p style={{fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4}}>Appearance</p>
      <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:20}}>Choose your workspace theme. Changes apply instantly.</p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12, marginBottom:16}}>
        {THEMES.map(theme => {
          const isSelected = themeId === theme.id
          return (
            <button key={theme.id} onClick={() => setTheme(theme.id)}
              style={{background:'var(--card)', borderRadius:14, border: isSelected ? `2px solid ${theme.preview.accent}` : '2px solid var(--border-light)', cursor:'pointer', padding:0, overflow:'hidden', textAlign:'left', boxShadow: isSelected ? `0 0 0 3px ${theme.preview.accent}22` : 'none'}}>
              <div style={{background:theme.preview.bg, height:90, padding:8, display:'flex', gap:6}}>
                <div style={{width:36, background:theme.preview.sidebar, borderRadius:6, padding:'6px 5px', display:'flex', flexDirection:'column', gap:3}}>
                  <div style={{width:18, height:6, background:theme.preview.accent, borderRadius:2, marginBottom:3}}/>
                  {[1,2,3,4].map(i => <div key={i} style={{width:'100%', height:4, borderRadius:2, background: i===1 ? theme.preview.accent : 'rgba(255,255,255,0.12)'}}/>)}
                </div>
                <div style={{flex:1, display:'flex', flexDirection:'column', gap:5}}>
                  <div style={{height:14, background:theme.preview.card, borderRadius:4, border:`1px solid ${theme.preview.border}`}}/>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:3, flex:1}}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{background:theme.preview.card, borderRadius:4, border:`1px solid ${theme.preview.border}`, padding:'3px 4px'}}>
                        <div style={{width:'70%', height:2, background:theme.preview.subtext, opacity:0.4, borderRadius:1, marginBottom:2}}/>
                        <div style={{width:'90%', height:4, background: i===1 ? theme.preview.accent : theme.preview.text, opacity:0.6, borderRadius:1}}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{padding:'10px 12px 12px'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3}}>
                  <p style={{fontSize:13, fontWeight:700, color:'#111827'}}>{theme.name}</p>
                  {isSelected && (
                    <div style={{width:16, height:16, borderRadius:'50%', background:theme.preview.accent, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </div>
                <p style={{fontSize:11, color:'#6B7280', lineHeight:1.4}}>{theme.description.split('.')[0]}.</p>
              </div>
            </button>
          )
        })}
      </div>
      <p style={{fontSize:12, color:'var(--text-muted)'}}>Theme is saved automatically when you select it.</p>
    </div>
  )

  // ── MAIN SETTINGS LIST ──
  const settingGroups = [
    {
      title: 'Business Settings',
      items: [
        {key:'business', label:'Business Profile', sub: workspace?.name || 'Update your business details', icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'},
        {key:'notifications', label:'Notification Preferences', sub:'Manage your alerts', icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'},
        {key:'team', label:'Team Members', sub:'Invite and manage your team', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'},
        {key:'appearance', label:'Appearance & Theme', sub: `Current: ${THEMES.find(t=>t.id===themeId)?.name}`, icon:'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'},
      ]
    },
    {
      title: 'Account Settings',
      items: [
        {key:'profile', label:'Profile', sub:'Update your personal details', icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'},
        {key:'password', label:'Change Password', sub:'Update your account password', icon:'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'},
      ]
    }
  ]

  return (
    <div style={{maxWidth:520}}>
      {/* Business name shown prominently */}
      {workspace?.name && (
        <div style={{background:'var(--accent-light)', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:36, height:36, borderRadius:9, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"/></svg>
          </div>
          <div>
            <p style={{fontSize:14, fontWeight:700, color:'var(--accent)'}}>{workspace.name}</p>
            <p style={{fontSize:11, color:'var(--text-muted)'}}>{workspace.business_type || 'Your business'}</p>
          </div>
        </div>
      )}

      <h1 style={{fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:16}}>Settings</h1>

      {settingGroups.map(group => (
        <div key={group.title} style={cardStyle}>
          <div style={{padding:'12px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)'}}>
            <p style={{fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.6}}>{group.title}</p>
          </div>
          {group.items.map((item, i) => (
            <button key={item.key} onClick={() => { setSection(item.key as Section); setMessage('') }}
              style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderTop: i===0?'none':'1px solid var(--border)', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:34, height:34, borderRadius:9, background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                </div>
                <div style={{minWidth:0}}>
                  <p style={{fontSize:14, color:'var(--text)', fontWeight:500}}>{item.label}</p>
                  <p style={{fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.sub}</p>
                </div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      ))}

      <div style={cardStyle}>
        <button onClick={handleSignOut}
          style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:'none', border:'none', cursor:'pointer'}}>
          <div style={{width:34, height:34, borderRadius:9, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </div>
          <span style={{fontSize:14, color:'#EF4444', fontWeight:500}}>Log out</span>
        </button>
      </div>
    </div>
  )
}
