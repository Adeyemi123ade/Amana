'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { THEMES, type ThemeId } from '@/lib/theme/themes'

const supabase = createClient()

type Section = null | 'business' | 'profile' | 'password' | 'notifications' | 'team' | 'appearance' | 'kyc'

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
  const [savingNotifs, setSavingNotifs] = useState(false)

  const [biz, setBiz] = useState({ name:'', type:'', email:'', phone:'', address:'', website:'', instagram:'', bankName:'', accountNumber:'', accountName:'' })
  const [profile, setProfile] = useState({ fullName:'', email:'', phone:'', country:'' })
  const [pwd, setPwd] = useState({ newPwd:'', confirm:'' })
  const [pwdErr, setPwdErr] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [notifs, setNotifs] = useState({ email:true, payment:true, appointment:true, invoice:true, weekly:true })
  const [inviteEmail, setInviteEmail] = useState('')
  const [invites, setInvites] = useState<any[]>([])
  const [invitesLoading, setInvitesLoading] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteMsgOk, setInviteMsgOk] = useState(true)

  const loadInvites = async (wsId: string) => {
    setInvitesLoading(true)
    const { data } = await supabase.from('team_invites').select('*').eq('workspace_id', wsId).order('created_at', { ascending: false })
    setInvites(data || [])
    setInvitesLoading(false)
  }

  const sendInvite = async () => {
    setInviteMsg('')
    const email = inviteEmail.trim().toLowerCase()
    if (!email) { setInviteMsgOk(false); setInviteMsg('Please enter an email address'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setInviteMsgOk(false); setInviteMsg('Please enter a valid email address'); return }
    const ws = workspaceRef.current
    if (!ws || !user) { setInviteMsgOk(false); setInviteMsg('Your workspace is still loading. Please wait a moment.'); return }
    setSendingInvite(true)
    try {
      const res = await fetch('/api/team-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, workspaceId: ws.id, invitedBy: user.id, workspaceName: ws.name }),
      })
      const data = await res.json()
      if (!res.ok) { setInviteMsgOk(false); setInviteMsg(data.error || 'Could not send invite'); }
      else { setInviteMsgOk(true); setInviteMsg('Invite sent to ' + email); setInviteEmail(''); loadInvites(ws.id) }
    } catch {
      setInviteMsgOk(false); setInviteMsg('Connection error. Please try again.')
    }
    setSendingInvite(false)
  }

  useEffect(() => {
    if (section === 'team' && workspaceRef.current) loadInvites(workspaceRef.current.id)
  }, [section])

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
        setBiz({ name:ws.name||'', type:ws.business_type||'', email:ws.business_email||'', phone:ws.whatsapp_number||'', address:ws.business_address||'', website:ws.website||'', instagram:ws.instagram||'', bankName:ws.bank_name||'', accountNumber:ws.account_number||'', accountName:ws.account_name||''  })
        if (ws.notification_prefs) setNotifs(ws.notification_prefs)
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
      name: biz.name.trim(), business_type: biz.type, business_email: biz.email.trim() || null,
      whatsapp_number: biz.phone.trim() || null, business_address: biz.address.trim() || null,
      website: biz.website.trim() || null, instagram: biz.instagram.trim() || null,
      bank_name: biz.bankName.trim() || null, account_number: biz.accountNumber.trim() || null, account_name: biz.accountName.trim() || null,
    }).eq('id', ws.id)
    setSavingBiz(false)
    if (error) fail('We could not save your business profile. Please try again.')
    else { ok('Business profile saved successfully'); router.refresh() }
  }

  const saveProfile = async () => {
    if (!profile.fullName.trim()) { fail('Full name cannot be empty'); return }
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: profile.fullName.trim(), phone: profile.phone.trim(), country: profile.country } })
    setSavingProfile(false)
    if (error) fail('We could not update your profile. Please try again.')
    else ok('Profile updated successfully')
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
    if (error) setPwdErr(error.message || 'We could not update your password. Please try again.')
    else { ok('Password updated successfully'); setPwd({ newPwd:'', confirm:'' }) }
  }

  const saveNotifs = async () => {
    const ws = workspaceRef.current || workspace
    if (!ws) return
    setSavingNotifs(true)
    await supabase.from('workspaces').update({ notification_prefs: notifs }).eq('id', ws.id)
    setSavingNotifs(false)
    ok('Notification preferences saved')
  }

  // Design system tokens — respond to dark/light mode
  const card: React.CSSProperties = { background:'var(--card)', border:'1px solid var(--border-light)', borderRadius:14, overflow:'hidden', marginBottom:8 }
  const row: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', cursor:'pointer', borderBottom:'1px solid var(--border)', textDecoration:'none' }
  const rowTitle: React.CSSProperties = { fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:2 }
  const rowSub: React.CSSProperties = { fontSize:12, color:'var(--text-muted)' }
  const chevron = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
  const inp: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid var(--border-light)', fontSize:14, color:'var(--text)', outline:'none', boxSizing:'border-box', background:'var(--bg-secondary)' }
  const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:6 }
  const btn: React.CSSProperties = { height:44, background:'var(--accent)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', width:'100%', marginTop:4 }
  const secHead: React.CSSProperties = { fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, padding:'20px 4px 8px' }

  const iconBox = (icon: React.ReactNode, bg: string) => (
    <div style={{ width:40, height:40, background:bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
  )

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Loading settings...</div>

  // ── Detail sections ──
  if (section === 'business') return (
    <div>
      <button onClick={() => setSection(null)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Business Profile</h2>
      {message && <div style={{ padding:'10px 14px', borderRadius:8, background:msgOk?'#F0FDF4':'#FEF2F2', color:msgOk?'#16A34A':'#DC2626', fontSize:13, marginBottom:16 }}>{message}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {[
          ['Business Name *','name','text','Your business name'],
          ['Business Type','type','text','e.g. Retail, Services, Food'],
          ['Business Email','email','email','business@example.com'],
          ['WhatsApp Number','phone','tel','+234 800 000 0000'],
          ['Business Address','address','text','Your physical address'],
          ['Website','website','url','https://'],
          ['Instagram Handle','instagram','text','@yourbusiness'],
          ['Bank Name','bankName','text','e.g. Access Bank'],
          ['Account Number','accountNumber','text','10-digit account number'],
          ['Account Name','accountName','text','Name on account'],
        ].map(([label, key, type, ph]) => (
          <div key={key as string}>
            <label style={lbl}>{label as string}</label>
            <input type={type as string} style={inp} placeholder={ph as string}
              value={(biz as any)[key as string]}
              onChange={e => setBiz(b => ({ ...b, [key as string]: e.target.value }))} />
          </div>
        ))}
        <button onClick={saveBiz} disabled={savingBiz} style={btn}>{savingBiz ? 'Saving...' : 'Save Business Profile'}</button>
      </div>
    </div>
  )

  if (section === 'profile') return (
    <div>
      <button onClick={() => setSection(null)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Personal Details</h2>
      {message && <div style={{ padding:'10px 14px', borderRadius:8, background:msgOk?'#F0FDF4':'#FEF2F2', color:msgOk?'#16A34A':'#DC2626', fontSize:13, marginBottom:16 }}>{message}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {[
          ['Full Name','fullName','text','Your full name'],
          ['Phone Number','phone','tel','+234 800 000 0000'],
          ['Country','country','text','e.g. Nigeria'],
        ].map(([label, key, type, ph]) => (
          <div key={key as string}>
            <label style={lbl}>{label as string}</label>
            <input type={type as string} style={inp} placeholder={ph as string}
              value={(profile as any)[key as string]}
              onChange={e => setProfile(p => ({ ...p, [key as string]: e.target.value }))} />
          </div>
        ))}
        <div>
          <label style={lbl}>Email Address <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(cannot be changed)</span></label>
          <input style={{ ...inp, opacity:0.6, cursor:'not-allowed' }} value={profile.email} readOnly />
        </div>
        <button onClick={saveProfile} disabled={savingProfile} style={btn}>{savingProfile ? 'Saving...' : 'Save Personal Details'}</button>
      </div>
    </div>
  )

  if (section === 'password') return (
    <div>
      <button onClick={() => setSection(null)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Update Password</h2>
      {message && <div style={{ padding:'10px 14px', borderRadius:8, background:msgOk?'#F0FDF4':'#FEF2F2', color:msgOk?'#16A34A':'#DC2626', fontSize:13, marginBottom:16 }}>{message}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={lbl}>New Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPwd ? 'text' : 'password'} style={{...inp, paddingRight:44}} placeholder="At least 8 characters" value={pwd.newPwd} onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))} />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:12, fontWeight:600 }}>
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label style={lbl}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPwd ? 'text' : 'password'} style={{...inp, paddingRight:44}} placeholder="Repeat new password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:12, fontWeight:600 }}>
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {pwdErr && <p style={{ fontSize:13, color:'#DC2626' }}>{pwdErr}</p>}
        <button onClick={savePwd} disabled={savingPwd} style={btn}>{savingPwd ? 'Updating...' : 'Update Password'}</button>
      </div>
    </div>
  )

  if (section === 'notifications') return (
    <div>
      <button onClick={() => setSection(null)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Notification Preferences</h2>
      {message && <div style={{ padding:'10px 14px', borderRadius:8, background:'#F0FDF4', color:'#16A34A', fontSize:13, marginBottom:16 }}>{message}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {([
          ['email','Email Notifications','Receive updates and alerts by email'],
          ['payment','Payment Alerts','Get notified when payments are received'],
          ['appointment','Appointment Reminders','Reminders for upcoming appointments'],
          ['invoice','Invoice Updates','When invoices are viewed or paid'],
          ['weekly','Weekly Summary','Weekly digest of your business activity'],
        ] as [string, string, string][]).map(([key, title, desc]) => (
          <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{title}</p>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{desc}</p>
            </div>
            <button onClick={() => setNotifs(n => ({ ...n, [key]: !((n as any)[key]) }))}
              style={{ width:48, height:26, borderRadius:20, background:(notifs as any)[key]?'var(--accent)':'var(--border-light)', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <span style={{ position:'absolute', top:3, left:(notifs as any)[key]?22:3, width:20, height:20, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>
        ))}
      </div>
      <button onClick={saveNotifs} disabled={savingNotifs} style={{ ...btn, marginTop:20 }}>{savingNotifs ? 'Saving...' : 'Save Preferences'}</button>
    </div>
  )

  if (section === 'appearance') return (
    <div>
      <button onClick={() => setSection(null)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Appearance & Theme</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:12 }}>
        {THEMES.map(t => (
          <button key={t.id} onClick={() => setTheme(t.id as ThemeId)}
            style={{ padding:'14px 12px', borderRadius:12, border: themeId === t.id ? '2px solid var(--accent)' : '1px solid var(--border-light)', background: themeId === t.id ? 'var(--accent-light)' : 'var(--card)', cursor:'pointer', textAlign:'left' }}>
            <div style={{ display:'flex', gap:4, marginBottom:10 }}>
              {Object.values(t.preview).map((c, i) => <div key={i} style={{ width:18, height:18, borderRadius:4, background:c }}/>)}
            </div>
            <p style={{ fontSize:12, fontWeight: themeId === t.id ? 700 : 500, color: themeId === t.id ? 'var(--accent)' : 'var(--text)' }}>{t.name}</p>
          </button>
        ))}
      </div>
    </div>
  )

  if (section === 'team') return (
    <div>
      <button onClick={() => setSection(null)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Settings
      </button>
      <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Team Members</h2>

      {inviteMsg && <div style={{ padding:'10px 14px', borderRadius:8, background:inviteMsgOk?'#F0FDF4':'#FEF2F2', color:inviteMsgOk?'#16A34A':'#DC2626', fontSize:13, marginBottom:16 }}>{inviteMsg}</div>}

      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        <input type="email" style={inp} placeholder="teammate@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
        <button onClick={sendInvite} disabled={sendingInvite} style={{ ...btn, width:'auto', padding:'0 20px', whiteSpace:'nowrap' }}>{sendingInvite ? 'Sending...' : 'Invite'}</button>
      </div>

      <p style={secHead}>INVITES SENT</p>
      <div style={card}>
        {invitesLoading ? (
          <div style={{ padding:20, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>Loading...</div>
        ) : invites.length === 0 ? (
          <div style={{ padding:20, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No invites sent yet</div>
        ) : invites.map((inv, i) => {
          const statusColor: Record<string,[string,string]> = {
            PENDING: ['#D97706','#FFFBEB'], ACCEPTED: ['#16A34A','#F0FDF4'],
            DECLINED: ['#DC2626','#FEF2F2'], EXPIRED: ['var(--text-muted)','var(--bg)'],
          }
          const [sc, sb] = statusColor[inv.status] || statusColor.PENDING
          return (
            <div key={inv.id} style={{ ...row, borderBottom: i === invites.length-1 ? 'none' : '1px solid var(--border)' }}>
              <div>
                <p style={rowTitle}>{inv.email}</p>
                <p style={rowSub}>Sent {new Date(inv.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</p>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:sc, background:sb, padding:'4px 10px', borderRadius:20, border:'1px solid '+sc+'33' }}>
                {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── Main settings list ──
  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:4 }}>Settings</h1>
        <p style={{ fontSize:13, color:'var(--text-muted)' }}>Manage your account and business preferences</p>
      </div>

      {message && <div style={{ padding:'10px 14px', borderRadius:8, background:msgOk?'#F0FDF4':'#FEF2F2', color:msgOk?'#16A34A':'#DC2626', fontSize:13, marginBottom:16 }}>{message}</div>}

      <p style={secHead}>BUSINESS SETTINGS</p>
      <div style={card}>
        {[
          { key:'business', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, bg:'var(--accent-light)', title:'Business Profile', sub: workspace?.name || 'Update your business information' },
          { key:'notifications', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>, bg:'var(--accent-light)', title:'Notifications', sub:'Manage your alerts' },
          { key:'kyc', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>, bg:'var(--accent-light)', title:'Identity Verification', sub:'Verify your business identity' },
          { key:'team', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, bg:'var(--accent-light)', title:'Team Members', sub:'Invite and manage your team' },
          { key:'appearance', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>, bg:'var(--accent-light)', title:'Appearance & Theme', sub:`Current: ${THEMES.find(t => t.id === themeId)?.name || 'Default'}` },
        ].map(item => (
          <div key={item.key} onClick={() => item.key === 'kyc' ? router.push('/onboarding/identity-verification') : setSection(item.key as Section)}
            style={{ ...row, borderBottom: item.key === 'appearance' ? 'none' : '1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {iconBox(item.icon, item.bg)}
              <div>
                <p style={rowTitle}>{item.title}</p>
                <p style={rowSub}>{item.sub}</p>
              </div>
            </div>
            {chevron}
          </div>
        ))}
      </div>

      <p style={secHead}>ACCOUNT SETTINGS</p>
      <div style={card}>
        {[
          { key:'profile', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>, bg:'var(--accent-light)', title:'Update your personal details', sub:'Name, phone, country' },
          { key:'password', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, bg:'var(--accent-light)', title:'Update your account password', sub:'Change your login password' },
        ].map((item, i, arr) => (
          <div key={item.key} onClick={() => setSection(item.key as Section)}
            style={{ ...row, borderBottom: i === arr.length-1 ? 'none' : '1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {iconBox(item.icon, item.bg)}
              <div>
                <p style={rowTitle}>{item.title}</p>
                <p style={rowSub}>{item.sub}</p>
              </div>
            </div>
            {chevron}
          </div>
        ))}
      </div>

      <div style={{ marginTop:8 }}>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/sign-in') }}
          style={{ width:'100%', padding:'14px 20px', background:'var(--card)', border:'1px solid var(--border-light)', borderRadius:14, display:'flex', alignItems:'center', gap:14, cursor:'pointer', textAlign:'left' }}>
          {iconBox(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>, '#FEF2F2')}
          <div>
            <p style={{ fontSize:14, fontWeight:600, color:'#DC2626', marginBottom:2 }}>Log out</p>
            <p style={{ fontSize:12, color:'var(--text-muted)' }}>Sign out of your account</p>
          </div>
        </button>
      </div>
    </div>
  )
}
