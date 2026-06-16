'use client'

import { useState, useEffect, useRef } from 'react'

const P = '#7C3AED'
const DARK = '#0c0720'
const PANEL = 'rgba(16,8,42,0.97)'
const BORDER = 'rgba(124,58,237,0.3)'

// ── typewriter ────────────────────────────────────────────
function useType(text: string, active: boolean, speed = 42) {
  const [out, setOut] = useState('')
  useEffect(() => {
    if (!active) { setOut(''); return }
    let i = 0; setOut('')
    const t = setInterval(() => { i++; setOut(text.slice(0, i)); if (i >= text.length) clearInterval(t) }, speed)
    return () => clearInterval(t)
  }, [text, active, speed])
  return out
}

// ── shared field ──────────────────────────────────────────
const Fld = ({ val, placeholder }: { val: string; placeholder?: string }) => (
  <div style={{ height: 40, background: 'rgba(255,255,255,0.05)', border: `1px solid ${val ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', transition: 'border-color 0.3s', minWidth: 0 }}>
    <span style={{ fontSize: 13, color: val ? 'white' : 'rgba(255,255,255,0.2)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val || placeholder || ''}</span>
  </div>
)
const Lbl = ({ children }: { children: string }) => (
  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.38)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.6 }}>{children}</label>
)
const Btn = ({ children, green, disabled }: { children: React.ReactNode; green?: boolean; disabled?: boolean }) => (
  <button style={{ width: '100%', height: 42, borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', background: green ? '#22C55E' : disabled ? 'rgba(124,58,237,0.3)' : P, transition: 'background 0.4s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
    {children}
  </button>
)

// ── Panel header ──────────────────────────────────────────
const PanelHeader = ({ title, sub }: { title: string; sub: string }) => (
  <div style={{ marginBottom: 20 }}>
    <p style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 3 }}>{title}</p>
    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{sub}</p>
  </div>
)

// ── SLIDE CONTENT COMPONENTS ──────────────────────────────

function SignInContent({ active }: { active: boolean }) {
  const email = useType('sulaimon@amana.app', active, 40)
  const [pass, setPass] = useState(false)
  const [btn, setBtn] = useState<'idle'|'loading'|'done'>('idle')
  useEffect(() => {
    if (!active) { setPass(false); setBtn('idle'); return }
    const t1 = setTimeout(() => setPass(true), 820)
    const t2 = setTimeout(() => setBtn('loading'), 1500)
    const t3 = setTimeout(() => setBtn('done'), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [active])
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
        <div style={{ width: 32, height: 32, background: P, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
        </div>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Amana</span>
      </div>
      <p style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 3 }}>Welcome back</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 22 }}>Sign in to your business account</p>
      <div style={{ marginBottom: 12 }}>
        <Lbl>Email Address</Lbl>
        <Fld val={email} placeholder="your@email.com" />
      </div>
      <div style={{ marginBottom: 20 }}>
        <Lbl>Password</Lbl>
        <div style={{ height: 40, background: 'rgba(255,255,255,0.05)', border: `1px solid ${pass ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', transition: 'border-color 0.3s' }}>
          <span style={{ fontSize: 20, letterSpacing: 4, color: 'white', opacity: pass ? 1 : 0, transition: 'opacity 0.5s' }}>{'●'.repeat(8)}</span>
        </div>
      </div>
      <Btn green={btn === 'done'}>
        {btn === 'loading' && <span style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />}
        {btn === 'done' ? '✓ Signed In Successfully' : btn === 'loading' ? 'Signing in...' : 'Sign In'}
      </Btn>
    </>
  )
}

function AddCustomerContent({ active }: { active: boolean }) {
  const name  = useType('Amaka Chisom', active, 44)
  const email = useType('amaka@chisom.com', active && name.length === 12, 40)
  const phone = useType('+234 802 345 6789', active && email.length === 16, 34)
  const addr  = useType('14 Allen Avenue, Ikeja', active && phone.length === 18, 28)
  const done  = addr.length > 0
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (!active) { setSaved(false); return }
    if (done) { const t = setTimeout(() => setSaved(true), 600); return () => clearTimeout(t) }
  }, [active, done])
  return (
    <>
      <PanelHeader title="Add Customer" sub="Save customer for future invoices and bookings" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div><Lbl>Full Name</Lbl><Fld val={name} placeholder="Customer name" /></div>
        <div><Lbl>Email</Lbl><Fld val={email} placeholder="email@example.com" /></div>
        <div><Lbl>Phone</Lbl><Fld val={phone} placeholder="+234..." /></div>
        <div><Lbl>Address</Lbl><Fld val={addr} placeholder="City, State" /></div>
      </div>
      <Btn green={saved} disabled={!done && !saved}>{saved ? '✓ Customer Saved!' : 'Save Customer'}</Btn>
      {saved && <p style={{ textAlign: 'center', fontSize: 11, color: '#22C55E', marginTop: 9 }}>Customer added to your directory</p>}
    </>
  )
}

function CreateInvoiceContent({ active }: { active: boolean }) {
  const [ph, setPh] = useState(0)
  useEffect(() => {
    if (!active) { setPh(0); return }
    const d = [500,1100,1800,2500,3300,4100]
    const ts = d.map((ms, i) => setTimeout(() => setPh(i + 1), ms))
    return () => ts.forEach(clearTimeout)
  }, [active])
  const rows = [
    { l: 'Customer', v: 'Amaka Chisom', p: 1 },
    { l: 'Service', v: 'Wedding Photography – Full Day', p: 2 },
    { l: 'Quantity', v: '1 session', p: 3 },
    { l: 'Due Date', v: '30 Jun 2026', p: 4 },
  ]
  return (
    <>
      <PanelHeader title="Create Invoice" sub="INV-0024 · John's Photography" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
        {rows.map(r => (
          <div key={r.l} style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: ph >= r.p ? 1 : 0.15, transition: 'opacity 0.5s' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', minWidth: 68, flexShrink: 0 }}>{r.l}</span>
            <div style={{ flex: 1 }}><Fld val={ph >= r.p ? r.v : ''} /></div>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, opacity: ph >= 5 ? 1 : 0.15, transition: 'opacity 0.5s' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Total</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: '#A78BFA' }}>₦185,000</span>
      </div>
      <Btn green={ph >= 6} disabled={ph < 5}>{ph >= 6 ? '✓ Invoice Sent via Email' : '📧 Send Invoice'}</Btn>
      {ph >= 6 && <p style={{ textAlign: 'center', fontSize: 11, color: '#22C55E', marginTop: 9 }}>Payment link delivered to customer</p>}
    </>
  )
}

function AppointmentContent({ active }: { active: boolean }) {
  const [ph, setPh] = useState(0)
  useEffect(() => {
    if (!active) { setPh(0); return }
    const d = [400,900,1500,2200,3000,3800]
    const ts = d.map((ms, i) => setTimeout(() => setPh(i + 1), ms))
    return () => ts.forEach(clearTimeout)
  }, [active])
  return (
    <>
      <PanelHeader title="Book Appointment" sub="Schedule a session with your customer" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { l: 'Customer', v: 'Amaka Chisom', p: 1, span: 2 },
          { l: 'Service',  v: 'Product Shoot – 4 hrs', p: 2, span: 2 },
          { l: 'Date',     v: '20 June 2026', p: 3, span: 1 },
          { l: 'Time',     v: '10:00 AM',     p: 3, span: 1 },
        ].map(f => (
          <div key={f.l} style={{ gridColumn: `span ${f.span}`, opacity: ph >= f.p ? 1 : 0.15, transition: 'opacity 0.5s' }}>
            <Lbl>{f.l}</Lbl>
            <Fld val={ph >= f.p ? f.v : ''} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14, opacity: ph >= 4 ? 1 : 0.15, transition: 'opacity 0.5s' }}>
        <Lbl>Notes</Lbl>
        <Fld val={ph >= 4 ? 'Studio session, 3 outfit changes' : ''} />
      </div>
      <Btn green={ph >= 6} disabled={ph < 4}>{ph >= 6 ? '✓ Appointment Booked' : 'Book Appointment'}</Btn>
      {ph >= 6 && <p style={{ textAlign: 'center', fontSize: 11, color: '#22C55E', marginTop: 9 }}>Confirmation email sent to customer</p>}
    </>
  )
}

function PaymentContent({ active }: { active: boolean }) {
  const [ph, setPh] = useState(0)
  useEffect(() => {
    if (!active) { setPh(0); return }
    const d = [300,900,1700,2600]
    const ts = d.map((ms, i) => setTimeout(() => setPh(i + 1), ms))
    return () => ts.forEach(clearTimeout)
  }, [active])
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', border: `3px solid ${ph >= 2 ? '#22C55E' : 'rgba(255,255,255,0.12)'}`, background: ph >= 2 ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', transition: 'all 0.6s' }}>
          {ph >= 2
            ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            : <span style={{ fontSize: 26 }}>💳</span>}
        </div>
        <p style={{ color: ph >= 2 ? '#22C55E' : 'white', fontSize: 18, fontWeight: 700, marginBottom: 4, transition: 'color 0.5s' }}>
          {ph >= 2 ? 'Payment Received!' : 'Awaiting Payment'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>
          {ph >= 2 ? 'Amaka Chisom paid via Paystack' : 'Customer is completing payment'}
        </p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px' }}>
        {[
          { l: 'Customer', v: 'Amaka Chisom', p: 1 },
          { l: 'Invoice',  v: 'INV-0024', p: 1 },
          { l: 'Amount',   v: '₦185,000', p: 2, c: '#A78BFA' },
          { l: 'Status',   v: '✓  PAID',  p: 2, c: '#22C55E' },
        ].map(r => (
          <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, opacity: ph >= r.p ? 1 : 0.15, transition: 'opacity 0.5s' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{r.l}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: (r as any).c || 'white' }}>{ph >= r.p ? r.v : '—'}</span>
          </div>
        ))}
      </div>
      {ph >= 3 && <p style={{ textAlign: 'center', fontSize: 11, color: '#22C55E', marginTop: 12, animation: 'fadeUp 0.5s ease' }}>Dashboard revenue updated · Invoice marked Paid</p>}
    </>
  )
}

// ── Dashboard BG ──────────────────────────────────────────
function DashBG({ customerCount, invoiceCount, revenue }: { customerCount: number; invoiceCount: number; revenue: number }) {
  const fmt = (n: number) => n >= 1000000 ? '₦' + (n/1000000).toFixed(1) + 'M' : '₦' + (n/1000).toFixed(0) + 'K'
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '16px 20px', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: P, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 12 }}>John's Photography</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Good morning, John 👋</span>
      </div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { l: 'Revenue', v: fmt(revenue), c: '#22C55E' },
          { l: 'Invoices', v: String(invoiceCount), c: '#A78BFA' },
          { l: 'Customers', v: String(customerCount), c: '#F59E0B' },
          { l: 'Appointments', v: '8', c: '#3B82F6' },
          { l: 'Payments', v: '19', c: '#22C55E' },
        ].map(s => (
          <div key={s.l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '9px 10px' }}>
            <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 5, textTransform: 'uppercase' }}>{s.l}</p>
            <p style={{ fontSize: 14, fontWeight: 900, color: s.c, transition: 'all 0.5s' }}>{s.v}</p>
          </div>
        ))}
      </div>
      {/* Chart + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '10px 12px' }}>
          <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', marginBottom: 8, textTransform: 'uppercase' }}>Revenue — 6 Months</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 44 }}>
            {[35,52,40,68,55,85].map((h,i) => (
              <div key={i} style={{ flex: 1, height: h+'%', background: i===5 ? P : `${P}44`, borderRadius: '2px 2px 0 0', minHeight: 4 }} />
            ))}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '10px 12px' }}>
          <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', marginBottom: 8, textTransform: 'uppercase' }}>Recent Activity</p>
          {[['Amaka Chisom','₦185,000','Paid','#22C55E'],['Kemi Adeyemi','₦92,000','Unpaid','#F59E0B'],['Dayo Okonkwo','₦340,000','Paid','#22C55E']].map(([n,a,s,c])=>(
            <div key={n as string} style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
              <span style={{ fontSize:10,color:'rgba(255,255,255,0.5)' }}>{n}</span>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:10,fontWeight:700,color:'white' }}>{a}</p>
                <p style={{ fontSize:8,color:c as string }}>{s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── CAROUSEL ──────────────────────────────────────────────
const SLIDES = [
  { id: 'signin',      duration: 5000, Component: SignInContent },
  { id: 'customer',    duration: 7000, Component: AddCustomerContent },
  { id: 'invoice',     duration: 8000, Component: CreateInvoiceContent },
  { id: 'appointment', duration: 8000, Component: AppointmentContent },
  { id: 'payment',     duration: 6500, Component: PaymentContent },
]

type PanelState = 'entering' | 'active' | 'exiting'

interface PanelItem { idx: number; state: PanelState; key: number }

export default function AmanaDemo() {
  const [panels, setPanels] = useState<PanelItem[]>([{ idx: 0, state: 'active', key: 0 }])
  const [stats, setStats] = useState({ revenue: 1340000, invoices: 23, customers: 47 })
  const keyRef = useRef(1)
  const currentRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advance = () => {
    const next = (currentRef.current + 1) % SLIDES.length
    currentRef.current = next
    const k = keyRef.current++

    // Add next panel entering from right, while current exits
    setPanels(prev => [
      ...prev.map(p => p.state === 'active' ? { ...p, state: 'exiting' as PanelState } : p),
      { idx: next, state: 'entering' as PanelState, key: k },
    ])

    // Bring next panel to active
    setTimeout(() => {
      setPanels(prev =>
        prev
          .filter(p => p.state !== 'exiting')
          .map(p => p.state === 'entering' ? { ...p, state: 'active' as PanelState } : p)
      )
      // Update stats on certain slides
      if (next === 2) setStats(s => ({ ...s, customers: s.customers + 1 }))
      if (next === 3) setStats(s => ({ ...s, invoices: s.invoices + 1 }))
      if (next === 0) setStats(s => ({ ...s, revenue: s.revenue + 185000 }))
    }, 550)
  }

  useEffect(() => {
    timerRef.current = setTimeout(advance, SLIDES[0].duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  useEffect(() => {
    const active = panels.find(p => p.state === 'active')
    if (!active) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(advance, SLIDES[active.idx].duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [panels])

  const getTransform = (state: PanelState) => {
    if (state === 'entering') return 'translateX(110%)'
    if (state === 'exiting')  return 'translateX(-110%)'
    return 'translateX(0)'
  }

  const getOpacity = (state: PanelState) => state === 'active' ? 1 : 0.35

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.25)', background: DARK, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', height: 460 }}>

      {/* Dashboard background — always visible */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <DashBG {...stats} />
      </div>

      {/* Dark gradient overlay so panels stand out */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />

      {/* Panel carousel — overflow hidden clip region */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {panels.map(panel => {
          const { Component } = SLIDES[panel.idx]
          const isActive = panel.state === 'active'
          return (
            <div key={panel.key} style={{
              position: 'absolute',
              width: 'min(380px, 88vw)',
              background: PANEL,
              border: `1px solid ${BORDER}`,
              borderRadius: 18,
              padding: '26px 24px 24px',
              backdropFilter: 'blur(28px)',
              boxShadow: isActive
                ? '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.3), 0 0 60px rgba(124,58,237,0.1)'
                : '0 8px 32px rgba(0,0,0,0.4)',
              transform: getTransform(panel.state),
              opacity: getOpacity(panel.state),
              transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease',
              zIndex: isActive ? 10 : 5,
              maxHeight: '90%',
              overflowY: 'auto',
            }}>
              <Component active={isActive} />
            </div>
          )
        })}
      </div>

      {/* Subtle dot indicators — no labels */}
      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 20, pointerEvents: 'none' }}>
        {SLIDES.map((_, i) => {
          const activePanel = panels.find(p => p.state === 'active')
          const isCurrent = activePanel?.idx === i
          return (
            <div key={i} style={{ width: isCurrent ? 22 : 6, height: 6, borderRadius: 3, background: isCurrent ? '#A78BFA' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
          )
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}
