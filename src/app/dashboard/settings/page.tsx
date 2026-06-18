'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { THEMES, type ThemeId } from '@/lib/theme/themes'

// Create client ONCE outside component - permanent fix
const supabase = createClient()

type Section = null | 'business' | 'profile' | 'password' | 'notifications' | 'team' | 'appearance' | 'kyc'

const inp: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white' }
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }

export default function SettingsPage() {
  const router = useRouter()
  const { themeId, setTheme } = useTheme()
  const [section, setSection] = useState<Section>(null)
  const [message, setMessage] = useState('')
  const [msgOk, setMsgOk] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const workspaceRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingBiz, setSavingBiz] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const [biz, setBiz] = useState({ name:'', type:'', email:'', phone:'', address:'', website:'', instagram:'', bankName:'', accountNumber:'', accountName:'' })
  const [profile, setProfile] = useState({ fullName:'', email:'', phone:'', country:'' })
  const [pwd, setPwd] = useState({ newPwd:'', confirm:'' })
  const [pwdErr, setPwdErr] = useState('')
  const [notifs, setNotifs] = useState({ email:true, payment:true, appointment:true, invoice:true, weekly:true })
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      setUser(u)
      setProfile({ fullName: u.user_metadata?.full_name || '', email: u.email || '', phone: u.user_metadata?.phone || '', country: u.user_metadata?.country || '' })
      const { data: ws } = await supabase.from('workspaces').select('*').eq('created_by', u.id).maybeSingle()
      if (ws) {
        setWorkspace(ws)
        workspaceRef.current = ws
        setBiz({ name:ws.name||'', type:ws.business_type||'', email:ws.business_email||'', phone:ws.whatsapp_number||'', address:ws.business_address||'', website:ws.website||'', instagram:ws.instagram||'', bankName:ws.bank_name||'', accountNumber:ws.account_number||'', accountName:ws.account_name||'' })
      }
      setLoading(false)
    }
    load()
  }, [])

  const ok = (m: string) => { setMessage(m); setMsgOk(true); setTimeout(() => setMessage(''), 4000) }
  const fail = (m: string) => { setMessage(m); setMsgOk(false); setTimeout(() => setMessage(''), 6000) }

  const saveBiz = async () => {
    if (!biz.name.trim()) { fail('Business name cannot be empty'); return }
    const ws = workspaceRef.current || workspace
    if (!ws) { fail('Workspace not loaded yet. Please refresh and try again.'); return }
    setSavingBiz(true)
    const { error } = await supabase.from('workspaces').update({
      name: biz.name.trim(),
      business_type: biz.type,
      business_email: biz.email.trim() || null,
      whatsapp_number: biz.phone.trim() || null,
      business_address: biz.address.trim() || null,
      website: biz.website.trim() || null,
      instagram: biz.instagram.trim() || null,
      bank_name: biz.bankName.trim() || null,
      account_number: biz.accountNumber.trim() || null,
      account_name: biz.accountName.trim() || null,
    }).eq('id', ws.id)
    setSavingBiz(false)
    if (error) { fail('We could not save your business profile. Please try again.') }
    else {
      ok('Business profile saved successfully')
      // Refresh the dashboard so the new name appears immediately
      router.refresh()
    }
  }

  const saveProfile = async () => {
    if (!profile.fullName.trim()) { fail('Full name cannot be empty'); return }
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: profile.fullName.trim(), phone: profile.phone.trim(), country: profile.country } })
    setSavingProfile(false)
    if (error) { fail('We could not update your profile. Please try again.') }
    else { ok('Profile updated successfully') }
  }

  const savePwd = async () => {
    setPwdErr('')
    if (!pwd.newPwd) { setPwdErr('Please enter a new password'); return }
    if (pwd.newPwd !== pwd.confirm) { setPwdErr('Passwords do not match'); return }
    if (pwd.newPwd.length < 8) { setPwdErr('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(pwd.newPwd)) { setPwdErr('Must include at least one uppercase letter'); return }
    if (!/[^A-Za-z0-9]/.test(pwd.newPwd)) { setPwdErr('Must include at least one special character'); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: pwd.newPwd })
    setSavingPwd(false)
    if (error) { setPwdErr('We could not update your password. Please try again.') }
    else { ok('Password changed successfully'); setPwd({ newPwd:'', confirm:'' }) }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const MsgBox = () => !message ? null : (
    <div style={{ background:msgOk?'#F0FDF4':'#FEF2F2', border:`1px solid ${msgOk?'#BBF7D0':'#FEE2E2'}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:msgOk?'#16A34A':'#DC2626', marginBottom:14 }}>
      {message}
    </div>
  )

  const back = () => { setSection(null); setMessage(''); setPwdErr('') }

  const Btn = ({ onClick, saving, label }: { onClick:()=>void, saving:boolean, label:string }) => (
    <button onClick={onClick} disabled={saving}
      style={{ height:48, padding:'0 28px', background:'#7C3AED', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1, display:'inline-flex', alignItems:'center', gap:8 }}>
      {saving && <span style={{width:14,height:14,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>}
      {saving ? 'Saving...' : label}
    </button>
  )

  if (section === 'business') return (
    <div style={{maxWidth:600}}>
      <button onClick={back} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,marginBottom:20,padding:'8px 14px'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <p style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:4}}>Business Profile</p>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:16}}>This information appears on your invoices and customer-facing pages</p>
      <MsgBox/>
      {loading ? <p style={{color:'#6B7280',padding:20}}>Loading your business details...</p> : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',padding:20}}>
            <p style={{fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:0.5,marginBottom:14}}>Business Details</p>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label style={lbl}>Business Name <span style={{color:'#EF4444'}}>*</span></label>
                <input style={inp} value={biz.name} onChange={e => setBiz({...biz,name:e.target.value})} placeholder="Your business name"/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={lbl}>Business Type</label>
                  <input style={inp} value={biz.type} onChange={e => setBiz({...biz,type:e.target.value})} placeholder="e.g. Photography"/>
                </div>
                <div>
                  <label style={lbl}>Business Email</label>
                  <input type="email" style={inp} value={biz.email} onChange={e => setBiz({...biz,email:e.target.value})} placeholder="business@example.com"/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={lbl}>WhatsApp / Phone</label>
                  <input style={inp} value={biz.phone} onChange={e => setBiz({...biz,phone:e.target.value})} placeholder="+234 812 345 6789"/>
                </div>
                <div>
                  <label style={lbl}>Instagram</label>
                  <input style={inp} value={biz.instagram} onChange={e => setBiz({...biz,instagram:e.target.value})} placeholder="@yourhandle"/>
                </div>
              </div>
              <div>
                <label style={lbl}>Business Address</label>
                <input style={inp} value={biz.address} onChange={e => setBiz({...biz,address:e.target.value})} placeholder="Lagos, Nigeria"/>
              </div>
              <div>
                <label style={lbl}>Website</label>
                <input type="url" style={inp} value={biz.website} onChange={e => setBiz({...biz,website:e.target.value})} placeholder="https://yoursite.com"/>
              </div>
            </div>
          </div>
          <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',padding:20}}>
            <p style={{fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Bank Details</p>
            <p style={{fontSize:12,color:'#9CA3AF',marginBottom:14}}>Shown to customers who choose bank transfer payment</p>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label style={lbl}>Bank Name</label>
                <input style={inp} value={biz.bankName} onChange={e => setBiz({...biz,bankName:e.target.value})} placeholder="e.g. Access Bank, GTBank"/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={lbl}>Account Number</label>
                  <input style={inp} value={biz.accountNumber} onChange={e => setBiz({...biz,accountNumber:e.target.value})} placeholder="0123456789"/>
                </div>
                <div>
                  <label style={lbl}>Account Name</label>
                  <input style={inp} value={biz.accountName} onChange={e => setBiz({...biz,accountName:e.target.value})} placeholder="Business Account Name"/>
                </div>
              </div>
            </div>
          </div>
          <Btn onClick={saveBiz} saving={savingBiz} label="Save Business Profile"/>
        </div>
      )}
    </div>
  )

  if (section === 'profile') return (
    <div style={{maxWidth:520}}>
      <button onClick={back} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,marginBottom:20,padding:'8px 14px'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <p style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:4}}>Your Profile</p>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:16}}>Your personal account details</p>
      <MsgBox/>
      <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',padding:20,display:'flex',flexDirection:'column',gap:14}}>
        <div><label style={lbl}>Full Name</label><input style={inp} value={profile.fullName} onChange={e => setProfile({...profile,fullName:e.target.value})} placeholder="Your full name"/></div>
        <div>
          <label style={lbl}>Email Address</label>
          <input style={{...inp,background:'#F9FAFB',color:'#9CA3AF'}} value={profile.email} readOnly/>
          <p style={{fontSize:11,color:'#9CA3AF',marginTop:4}}>Email cannot be changed here</p>
        </div>
        <div><label style={lbl}>Phone Number</label><input style={inp} value={profile.phone} onChange={e => setProfile({...profile,phone:e.target.value})} placeholder="+234 812 345 6789"/></div>
        <div><label style={lbl}>Country</label><input style={inp} value={profile.country} onChange={e => setProfile({...profile,country:e.target.value})} placeholder="Nigeria"/></div>
        <Btn onClick={saveProfile} saving={savingProfile} label="Save Profile"/>
      </div>
    </div>
  )

  if (section === 'kyc') return (
    <div style={{maxWidth:520}}>
      <button onClick={back} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,marginBottom:20,padding:'8px 14px'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <p style={{fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:4}}>Identity Verification</p>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>Verify your business identity to unlock full platform features and build customer trust.</p>
      <MsgBox/>
      <div style={{background:'var(--card)',borderRadius:14,border:'1px solid var(--border)',padding:20,marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:10,background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div>
            <p style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>Business Identity Verification</p>
            <p style={{fontSize:12,color:'var(--text-muted)'}}>Upload a government-issued ID to verify your identity</p>
          </div>
        </div>
        <a href="/onboarding/identity-verification"
          style={{display:'block',background:'var(--accent)',color:'white',textDecoration:'none',padding:'12px 20px',borderRadius:10,fontSize:14,fontWeight:600,textAlign:'center'}}>
          Start Verification →
        </a>
      </div>
      <div style={{background:'var(--bg-secondary)',borderRadius:12,padding:16,fontSize:13,color:'var(--text-muted)',lineHeight:1.7}}>
        <p style={{fontWeight:600,color:'var(--text)',marginBottom:6}}>What you will need:</p>
        <p>• National ID (NIN), Passport, or Driver's License</p>
        <p>• A clear photo of the front of your document</p>
        <p>• A selfie holding the document</p>
        <p style={{marginTop:8}}>Verification is reviewed within 1–2 business days.</p>
      </div>
    </div>
  )

  if (section === 'password') return (
    <div style={{maxWidth:520}}>
      <button onClick={back} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,marginBottom:20,padding:'8px 14px'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <p style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:4}}>Change Password</p>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:16}}>Choose a strong password to keep your account secure</p>
      <MsgBox/>
      {pwdErr && <div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#DC2626',marginBottom:14}}>{pwdErr}</div>}
      <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',padding:20,display:'flex',flexDirection:'column',gap:14}}>
        <div><label style={lbl}>New Password</label><input type="password" style={inp} value={pwd.newPwd} onChange={e => setPwd({...pwd,newPwd:e.target.value})} placeholder="At least 8 characters"/></div>
        <div><label style={lbl}>Confirm New Password</label><input type="password" style={inp} value={pwd.confirm} onChange={e => setPwd({...pwd,confirm:e.target.value})} placeholder="Repeat new password"/></div>
        <div style={{background:'#F9FAFB',borderRadius:8,padding:12}}>
          {[{label:'At least 8 characters',met:pwd.newPwd.length>=8},{label:'One uppercase letter',met:/[A-Z]/.test(pwd.newPwd)},{label:'One lowercase letter',met:/[a-z]/.test(pwd.newPwd)},{label:'One special character',met:/[^A-Za-z0-9]/.test(pwd.newPwd)}].map(r => (
            <div key={r.label} style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
              <span style={{color:r.met?'#22C55E':'#D1D5DB',fontSize:12}}>{r.met?'✓':'○'}</span>
              <span style={{fontSize:12,color:r.met?'#111827':'#9CA3AF'}}>{r.label}</span>
            </div>
          ))}
        </div>
        <Btn onClick={savePwd} saving={savingPwd} label="Change Password"/>
      </div>
    </div>
  )

  if (section === 'notifications') return (
    <div style={{maxWidth:520}}>
      <button onClick={back} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,marginBottom:20,padding:'8px 14px'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <p style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:4}}>Notification Preferences</p>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:16}}>Choose what you want to be notified about</p>
      <MsgBox/>
      <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',overflow:'hidden'}}>
        {[{key:'email',label:'Email Notifications',desc:'General email updates'},{key:'payment',label:'Payment Reminders',desc:'When payments are due'},{key:'appointment',label:'Appointment Reminders',desc:'Before appointments'},{key:'invoice',label:'Invoice Alerts',desc:'For unpaid invoices'},{key:'weekly',label:'Weekly Summary',desc:'Business summary every Monday'}].map((n,i) => (
          <div key={n.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderTop:i>0?'1px solid #F3F4F6':'none'}}>
            <div>
              <p style={{fontSize:14,fontWeight:500,color:'#111827',marginBottom:2}}>{n.label}</p>
              <p style={{fontSize:12,color:'#6B7280'}}>{n.desc}</p>
            </div>
            <button onClick={() => setNotifs(s => ({...s,[n.key]:!s[n.key as keyof typeof s]}))}
              style={{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',background:notifs[n.key as keyof typeof notifs]?'#7C3AED':'#E5E7EB',position:'relative',flexShrink:0}}>
              <span style={{position:'absolute',top:2,left:notifs[n.key as keyof typeof notifs]?20:2,width:20,height:20,borderRadius:'50%',background:'white',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',display:'block'}}/>
            </button>
          </div>
        ))}
        <div style={{padding:'14px 18px',borderTop:'1px solid #F3F4F6',display:'flex',gap:10}}>
          <button onClick={() => ok('Notification preferences saved')}
            style={{height:44,padding:'0 24px',background:'#7C3AED',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}>
            Save Preferences
          </button>
          <button onClick={back}
            style={{height:44,padding:'0 20px',background:'none',border:'1px solid #E5E7EB',borderRadius:10,fontSize:14,fontWeight:500,color:'#6B7280',cursor:'pointer'}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  if (section === 'team') return (
    <div style={{maxWidth:520}}>
      <button onClick={back} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,marginBottom:20,padding:'8px 14px'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <p style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:4}}>Team Members</p>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:16}}>Invite colleagues to access this workspace</p>
      <MsgBox/>
      <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',padding:18,marginBottom:12}}>
        <p style={{fontSize:13,fontWeight:600,color:'#111827',marginBottom:10}}>Invite a team member</p>
        <div style={{display:'flex',gap:8}}>
          <input type="email" style={{...inp,flex:1}} placeholder="colleague@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}/>
          <button onClick={async () => {
            if (!inviteEmail.trim()) return
            if (!workspace) { fail('Workspace not loaded'); return }
            const res = await fetch('/api/team-invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: inviteEmail.trim(),
                workspaceId: workspace.id,
                invitedBy: user?.id,
                workspaceName: workspace.name,
              }),
            })
            const data = await res.json()
            if (res.ok) {
              if (data.emailSent) {
                ok(`Invitation sent to ${inviteEmail}`)
              } else {
                ok(`Invite created. Email could not be sent automatically — share this link: ${data.acceptUrl}`)
              }
              setInviteEmail('')
            }
            else fail(data.error || 'Could not send invite')
          }}
            style={{height:44,padding:'0 16px',background:'#7C3AED',color:'white',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',flexShrink:0}}>
            Send Invite
          </button>
        </div>
        <p style={{fontSize:11,color:'#9CA3AF',marginTop:8}}>Colleague will receive an email with a link to join this workspace.</p>
      </div>
      <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',padding:18}}>
        <p style={{fontSize:13,fontWeight:600,color:'#111827',marginBottom:10}}>Current Team</p>
        {/* Owner row */}
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid #F3F4F6'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#7C3AED',flexShrink:0}}>
            {(workspace?.name||user?.email||'U')[0].toUpperCase()}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:500,color:'#111827',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.user_metadata?.full_name||user?.email}</p>
            <p style={{fontSize:11,color:'#6B7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</p>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:'#7C3AED',background:'#EDE9FE',padding:'3px 10px',borderRadius:20,flexShrink:0}}>Owner</span>
        </div>
        {/* Role legend */}
        <div style={{marginTop:14,padding:12,background:'#F9FAFB',borderRadius:10}}>
          <p style={{fontSize:11,fontWeight:700,color:'#374151',marginBottom:8,textTransform:'uppercase',letterSpacing:0.4}}>Role Permissions</p>
          {[
            {role:'Owner', desc:'Full control including workspace settings', color:'#7C3AED'},
            {role:'Admin', desc:'Full access except workspace deletion', color:'#3B82F6'},
            {role:'Staff', desc:'Create and edit — cannot delete or manage team', color:'#F59E0B'},
            {role:'Viewer', desc:'Read-only — cannot create or edit anything', color:'#6B7280'},
          ].map(r => (
            <div key={r.role} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{fontSize:10,fontWeight:700,color:r.color,background:r.color+'18',padding:'2px 7px',borderRadius:10,minWidth:44,textAlign:'center'}}>{r.role}</span>
              <span style={{fontSize:11,color:'#6B7280'}}>{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (section === 'appearance') return (
    <div style={{maxWidth:640}}>
      <button onClick={back} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:9,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,marginBottom:20,padding:'8px 14px'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <p style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:4}}>Appearance</p>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:20}}>Choose your workspace theme. Changes apply instantly.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
        {THEMES.map(theme => {
          const isSelected = themeId === theme.id
          return (
            <button key={theme.id} onClick={() => setTheme(theme.id)}
              style={{background:'white',borderRadius:14,border:`2px solid ${isSelected?theme.preview.accent:'#E5E7EB'}`,cursor:'pointer',padding:0,overflow:'hidden',textAlign:'left',boxShadow:isSelected?`0 0 0 3px ${theme.preview.accent}22`:'none'}}>
              <div style={{background:theme.preview.bg,height:90,padding:8,display:'flex',gap:6}}>
                <div style={{width:36,background:theme.preview.sidebar,borderRadius:6,padding:'6px 5px',display:'flex',flexDirection:'column',gap:3}}>
                  <div style={{width:18,height:6,background:theme.preview.accent,borderRadius:2,marginBottom:3}}/>
                  {[1,2,3,4].map(i => <div key={i} style={{width:'100%',height:4,borderRadius:2,background:i===1?theme.preview.accent:'rgba(255,255,255,0.12)'}}/>)}
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:5}}>
                  <div style={{height:14,background:theme.preview.card,borderRadius:4,border:`1px solid ${theme.preview.border}`}}/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,flex:1}}>
                    {[1,2,3,4].map(i => <div key={i} style={{background:theme.preview.card,borderRadius:4,border:`1px solid ${theme.preview.border}`,padding:'3px 4px'}}><div style={{width:'70%',height:2,background:theme.preview.subtext,opacity:0.4,borderRadius:1,marginBottom:2}}/><div style={{width:'90%',height:4,background:i===1?theme.preview.accent:theme.preview.text,opacity:0.6,borderRadius:1}}/></div>)}
                  </div>
                </div>
              </div>
              <div style={{padding:'10px 12px 12px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                  <p style={{fontSize:13,fontWeight:700,color:'#111827'}}>{theme.name}</p>
                  {isSelected && <div style={{width:16,height:16,borderRadius:'50%',background:theme.preview.accent,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                </div>
                <p style={{fontSize:11,color:'#6B7280'}}>{theme.description.split('.')[0]}.</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // Main list
  const groups = [
    { title:'Business Settings', items:[
      {key:'business',label:'Business Profile',sub:workspace?.name||'Update your business details',icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'},
      {key:'notifications',label:'Notifications',sub:'Manage your alerts',icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'},
      {key:'kyc',label:'Identity Verification',sub:'Verify your business identity',icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'},
      {key:'team',label:'Team Members',sub:'Invite and manage your team',icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'},
      {key:'appearance',label:'Appearance & Theme',sub:`Current: ${THEMES.find(t=>t.id===themeId)?.name||'Professional Light'}`,icon:'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'},
    ]},
    { title:'Account Settings', items:[
      {key:'profile',label:'Profile',sub:'Update your personal details',icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'},
      {key:'password',label:'Change Password',sub:'Update your account password',icon:'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'},
    ]},
  ]

  return (
    <div style={{maxWidth:520}}>
      <h1 style={{fontSize:22,fontWeight:700,color:'#111827',marginBottom:20}}>Settings</h1>

      {groups.map(group => (
        <div key={group.title} style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',overflow:'hidden',marginBottom:12}}>
          <div style={{padding:'12px 18px',borderBottom:'1px solid #F3F4F6',background:'#F9FAFB'}}>
            <p style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:0.6}}>{group.title}</p>
          </div>
          {group.items.map((item,i) => (
            <button key={item.key} onClick={() => { setSection(item.key as Section); setMessage(''); setPwdErr('') }}
              style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderTop:i===0?'none':'1px solid #F9FAFB',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:34,height:34,borderRadius:9,background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                </div>
                <div>
                  <p style={{fontSize:14,color:'#111827',fontWeight:500}}>{item.label}</p>
                  <p style={{fontSize:11,color:'#9CA3AF'}}>{item.sub}</p>
                </div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      ))}

      <div style={{background:'white',borderRadius:14,border:'1px solid #E5E7EB',overflow:'hidden'}}>
        <button onClick={signOut} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'14px 18px',background:'none',border:'none',cursor:'pointer'}}>
          <div style={{width:34,height:34,borderRadius:9,background:'#FEF2F2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </div>
          <span style={{fontSize:14,color:'#EF4444',fontWeight:500}}>Log out</span>
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
