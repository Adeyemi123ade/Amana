'use client'

import { useState, useEffect, useRef } from 'react'

const P = '#7C3AED'
const DARK = '#0c0720'
const PANEL = 'rgba(16,8,42,0.98)'
const BORDER = 'rgba(124,58,237,0.35)'

// ── TYPEWRITER — slow, visible character by character ─────
function useType(text: string, active: boolean, speed = 65) {
  const [out, setOut] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (!active) { setOut(''); return }
    let i = 0
    setOut('')
    timerRef.current = setInterval(() => {
      i++
      setOut(text.slice(0, i))
      if (i >= text.length) { if (timerRef.current) clearInterval(timerRef.current) }
    }, speed)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [text, active, speed])
  return out
}

// ── BUTTON with visible click animation ───────────────────
function ClickBtn({ label, doneLabel, onClick, active, clickAt }: {
  label: string; doneLabel: string; onClick?: () => void;
  active: boolean; clickAt: number // ms after active=true to auto-click
}) {
  const [state, setState] = useState<'idle'|'pressing'|'loading'|'done'>('idle')
  useEffect(() => {
    if (!active) { setState('idle'); return }
    const t1 = setTimeout(() => setState('pressing'), clickAt)
    const t2 = setTimeout(() => setState('loading'), clickAt + 180)
    const t3 = setTimeout(() => { setState('done'); onClick?.() }, clickAt + 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [active, clickAt])

  return (
    <button style={{
      width: '100%', height: 44, borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700,
      color: 'white', cursor: 'default',
      background: state === 'done' ? '#22C55E' : P,
      transform: state === 'pressing' ? 'scale(0.97)' : 'scale(1)',
      boxShadow: state === 'pressing' ? 'none' : state === 'idle' ? `0 4px 14px ${P}66` : 'none',
      transition: 'transform 0.1s, background 0.4s, box-shadow 0.15s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {state === 'loading' && (
        <span style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
      )}
      {state === 'done' ? `✓ ${doneLabel}` : label}
    </button>
  )
}

// ── FIELD display ─────────────────────────────────────────
const Fld = ({ val, placeholder, icon, typing = false }: { val: string; placeholder: string; icon?: string; typing?: boolean }) => (
  <div style={{ height: 42, background: 'rgba(255,255,255,0.06)', border: `1px solid ${val ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 9, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, transition: 'border-color 0.3s' }}>
    {icon && <span style={{ fontSize: 13, opacity: 0.5 }}>{icon}</span>}
    <span style={{ fontSize: 13, color: val ? 'white' : 'rgba(255,255,255,0.25)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
      {val || placeholder}
    </span>
    {typing && <span style={{ width: 2, height: 14, background: '#A78BFA', display: 'inline-block', animation: 'blink 1s steps(1) infinite', flexShrink: 0 }} />}
  </div>
)
const Lbl = ({ t }: { t: string }) => (
  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t}</label>
)
const PanelHead = ({ num, title, sub }: { num: number; title: string; sub: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 26, height: 26, background: P, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 12 }}>Amana</span>
      </div>
      <p style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 3 }}>{title}</p>
      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{sub}</p>
    </div>
    <div style={{ width: 26, height: 26, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0 }}>{num}</div>
  </div>
)

// ── SLIDE 1: Sign In ──────────────────────────────────────
function SignInContent({ active }: { active: boolean }) {
  const email = useType('john@johnsphotography.com', active, 60)
  const [passPhase, setPassPhase] = useState(false)

  useEffect(() => {
    if (!active) { setPassPhase(false); return }
    // Start password after email finishes
    const delay = 'john@johnsphotography.com'.length * 60 + 400
    const t = setTimeout(() => setPassPhase(true), delay)
    return () => clearTimeout(t)
  }, [active])

  const pass = useType('••••••••', passPhase, 80)
  const allDone = pass.length >= 8
  // Click button 600ms after password finishes
  const clickAt = 'john@johnsphotography.com'.length * 60 + 400 + 8 * 80 + 600

  const emailDone = email.length === 'john@johnsphotography.com'.length
  const passDone = pass.length >= 8

  return (
    <>
      <PanelHead num={1} title="Sign In" sub="Welcome back! Please sign in to your account." />
      <div style={{ marginBottom: 12 }}>
        <Lbl t="Email address" />
        <Fld val={email} placeholder="john@johnsphotography.com" icon="✉" typing={!emailDone} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <Lbl t="Password" />
        <Fld val={pass} placeholder="••••••••" icon="🔒" typing={passPhase && !passDone} />
      </div>
      <ClickBtn label="Sign In" doneLabel="Signed In Successfully" active={active} clickAt={clickAt} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <input type="checkbox" defaultChecked style={{ accentColor: P }} /> Remember me
        </label>
        <span style={{ fontSize: 11, color: '#A78BFA' }}>Forgot password?</span>
      </div>
    </>
  )
}

// ── SLIDE 2: Add Customer ─────────────────────────────────
function AddCustomerContent({ active }: { active: boolean }) {
  const name  = useType('Amaka Chisom', active, 65)
  const email = useType('amaka.chisom@email.com', active && name.length === 12, 60)
  const addr  = useType('14 Allen Avenue, Lagos', active && email.length === 22, 55)

  const nameDone  = name.length === 12
  const emailDone2 = email.length === 22
  const addrDone  = addr.length === 22

  return (
    <>
      <PanelHead num={2} title="Add Customer" sub="Add a new customer to your business." />
      <div style={{ marginBottom: 12 }}>
        <Lbl t="Full name" />
        <Fld val={name} placeholder="Amaka Chisom" icon="👤" typing={!nameDone} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl t="Email address" />
        <Fld val={email} placeholder="amaka.chisom@email.com" icon="✉" typing={nameDone && !emailDone2} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <Lbl t="Address" />
        <Fld val={addr} placeholder="14 Allen Avenue, Lagos" icon="📍" typing={emailDone2 && !addrDone} />
      </div>
      <ClickBtn label="Save Customer" doneLabel="Customer Saved!" active={active} clickAt={12*65 + 22*60 + 22*55 + 500} />
    </>
  )
}

// ── SLIDE 3: Create Invoice ───────────────────────────────
function CreateInvoiceContent({ active }: { active: boolean }) {
  // Type each field sequentially — fully visible typing
  const customer = useType('Amaka Chisom', active, 65)
  const invNum   = useType('INV-0025', active && customer.length === 12, 70)
  const service  = useType('Wedding Photography – Full Day', active && invNum.length === 8, 55)
  const amount   = useType('₦185,000', active && service.length === 30, 70)

  const custDone    = customer.length === 12
  const invDone     = invNum.length === 8
  const svcDone     = service.length === 30
  const amtDone     = amount.length > 0

  return (
    <>
      <PanelHead num={4} title="Create Invoice" sub="Create a new invoice for your customer." />
      <div style={{ marginBottom: 12 }}>
        <Lbl t="Customer" />
        <Fld val={customer} placeholder="Amaka Chisom" icon="👤" typing={!custDone} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl t="Invoice Number" />
        <Fld val={invNum} placeholder="INV-0025" icon="📄" typing={custDone && !invDone} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl t="Service / Item" />
        <Fld val={service} placeholder="Wedding Photography – Full Day" icon="🎯" typing={invDone && !svcDone} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <Lbl t="Amount" />
        <Fld val={amount} placeholder="₦185,000" icon="💰" typing={svcDone && !amtDone} />
      </div>
      <ClickBtn label="Create Invoice" doneLabel="Invoice Created!" active={active} clickAt={12*65 + 8*70 + 30*55 + 8*70 + 500} />
    </>
  )
}

// ── SLIDE 4: Book Appointment ─────────────────────────────
function AppointmentContent({ active }: { active: boolean }) {
  const customer = useType('Amaka Chisom', active, 65)
  const service  = useType('Product Shoot – 4 hrs', active && customer.length === 12, 60)
  const date     = useType('20 June 2026', active && service.length === 21, 65)
  const time     = useType('10:00 AM', active && date.length === 12, 70)
  const notes    = useType('Studio session, 3 outfit changes', active && time.length === 8, 50)

  const custD = customer.length === 12
  const svcD  = service.length === 21
  const dateD = date.length === 12
  const timeD = time.length === 8
  const noteD = notes.length > 0

  return (
    <>
      <PanelHead num={3} title="Book Appointment" sub="Book a new appointment." />
      <div style={{ marginBottom: 12 }}>
        <Lbl t="Customer" />
        <Fld val={customer} placeholder="Amaka Chisom" icon="👤" typing={!custD} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl t="Service" />
        <Fld val={service} placeholder="Product Shoot – 4 hrs" icon="🎯" typing={custD && !svcD} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <Lbl t="Date" />
          <Fld val={date} placeholder="20 June 2026" typing={svcD && !dateD} />
        </div>
        <div>
          <Lbl t="Time" />
          <Fld val={time} placeholder="10:00 AM" typing={dateD && !timeD} />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Lbl t="Notes" />
        <Fld val={notes} placeholder="Studio session, 3 outfit changes" icon="📝" typing={timeD && !noteD} />
      </div>
      <ClickBtn label="Save Appointment" doneLabel="Appointment Booked!" active={active} clickAt={12*65 + 21*60 + 12*65 + 8*70 + 32*50 + 500} />
    </>
  )
}

// ── SLIDE 4 (was 5): Payment Received ─────────────────────
function PaymentContent({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!active) { setPhase(0); return }
    const ts = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2900),
    ]
    return () => ts.forEach(clearTimeout)
  }, [active])

  const rows = [
    { l: 'Customer', v: 'Amaka Chisom', p: 1 },
    { l: 'Invoice Number', v: 'INV-0025', p: 2 },
    { l: 'Amount Paid', v: '₦185,000', p: 3, c: '#A78BFA' },
    { l: 'Status', v: '✓  PAID', p: 4, c: '#22C55E' },
  ]

  return (
    <>
      <PanelHead num={6} title="Payment Received" sub="Payment has been confirmed." />
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', border: `3px solid ${phase >= 2 ? '#22C55E' : 'rgba(255,255,255,0.15)'}`, background: phase >= 2 ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: 'all 0.6s ease' }}>
          {phase >= 2
            ? <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            : <span style={{ fontSize: 24 }}>💳</span>}
        </div>
        <p style={{ color: phase >= 2 ? '#22C55E' : 'white', fontSize: 16, fontWeight: 700, transition: 'color 0.5s' }}>
          {phase >= 2 ? 'Payment Confirmed!' : 'Processing Payment...'}
        </p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
        {rows.map(r => (
          <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, opacity: phase >= r.p ? 1 : 0.1, transition: 'opacity 0.5s' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{r.l}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: (r as any).c || 'white' }}>{phase >= r.p ? r.v : '—'}</span>
          </div>
        ))}
      </div>
      {phase >= 4 && (
        <p style={{ textAlign: 'center', fontSize: 11, color: '#22C55E', marginTop: 12, animation: 'fadeUp 0.5s ease' }}>
          Dashboard revenue updated · Invoice marked Paid
        </p>
      )}
    </>
  )
}

// ── SLIDE 5: Send Invoice Email ───────────────────────────
function SendInvoiceEmailContent({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!active) { setPhase(0); return }
    // Phase 1: show options (500ms)
    // Phase 2: highlight Email (1200ms)
    // Phase 3: click Email (2000ms) — shows email preview
    // Phase 4: populate email fields (2800ms)
    // Phase 5: body with payment link appears (4000ms)
    const ts = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2800),
      setTimeout(() => setPhase(5), 4200),
    ]
    return () => ts.forEach(clearTimeout)
  }, [active])

  const invoiceLink = 'https://amana-two.vercel.app/invoice/inv-0025'

  return (
    <>
      <PanelHead num={5} title="Send Invoice" sub="Choose how to send INV-0025 to Amaka Chisom" />

      {phase < 3 ? (
        /* Step 1 & 2 — show delivery options */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '📧', label: 'Send via Email', sub: 'Deliver invoice to customer inbox', id: 'email' },
            { icon: '🔗', label: 'Copy Payment Link', sub: 'Share link via WhatsApp or SMS', id: 'link' },
            { icon: '⬇', label: 'Download PDF', sub: 'Save and attach manually', id: 'pdf' },
          ].map(opt => (
            <div key={opt.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px',
              background: phase >= 2 && opt.id === 'email' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${phase >= 2 && opt.id === 'email' ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10, transition: 'all 0.35s', opacity: phase >= 1 ? 1 : 0,
              cursor: 'pointer',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: phase >= 2 && opt.id === 'email' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, transition: 'background 0.35s' }}>
                {opt.icon}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: phase >= 2 && opt.id === 'email' ? '#A78BFA' : 'white', marginBottom: 2, transition: 'color 0.35s' }}>{opt.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>{opt.sub}</p>
              </div>
              {phase >= 2 && opt.id === 'email' && (
                <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Step 3–5 — email compose preview */
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
          {/* Email header bar */}
          <div style={{ background: 'rgba(124,58,237,0.15)', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📧</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>New Email — Gmail</span>
          </div>
          {/* Email fields */}
          <div style={{ padding: '12px 14px' }}>
            {[
              { l: 'To', v: 'amaka.chisom@email.com', show: phase >= 4 },
              { l: 'Subject', v: 'Invoice INV-0025 — Payment Request', show: phase >= 4 },
            ].map(f => (
              <div key={f.l} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', opacity: f.show ? 1 : 0, transition: 'opacity 0.5s' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', minWidth: 44, textTransform: 'uppercase' }}>{f.l}</span>
                <div style={{ flex: 1, height: 30, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 6, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                  <span style={{ fontSize: 11, color: 'white', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.v}</span>
                </div>
              </div>
            ))}
            {/* Email body */}
            <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', opacity: phase >= 5 ? 1 : 0, transition: 'opacity 0.6s', minHeight: 100 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 6 }}>Dear Amaka,</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 8 }}>
                Please find your invoice below.<br />
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Amount Due: </span><span style={{ fontWeight: 600, color: '#A78BFA' }}>₦185,000</span><br />
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Due Date: </span><span style={{ color: 'white' }}>30 Jun 2026</span>
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Pay securely online:</p>
              <div style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10 }}>🔗</span>
                <span style={{ fontSize: 10, color: '#A78BFA', wordBreak: 'break-all', fontFamily: 'monospace' }}>{invoiceLink}</span>
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>Best regards, John's Photography</p>
            </div>
          </div>
        </div>
      )}

      {/* Send button */}
      <ClickBtn
        label={phase < 3 ? 'Select Email to Continue' : '📨 Send Invoice Email'}
        doneLabel="Email Sent! Amaka Will Receive the Payment Link"
        active={active}
        clickAt={phase < 3 ? 99999 : 5500}
      />
    </>
  )
}

// ── Dashboard background ──────────────────────────────────
function DashBG() {
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '14px 18px', overflow: 'hidden', opacity: 0.35 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 20, height: 20, background: P, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 11 }}>John's Photography</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>Good morning, John 👋</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7, marginBottom: 10 }}>
        {[['Revenue','₦1.3M','#22C55E'],['Invoices','24','#A78BFA'],['Customers','48','#F59E0B'],['Appointments','8','#3B82F6'],['Payments','20','#22C55E']].map(([l,v,c])=>(
          <div key={l as string} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 9px' }}>
            <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)', marginBottom: 4, textTransform: 'uppercase' }}>{l}</p>
            <p style={{ fontSize: 13, fontWeight: 900, color: c as string }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', marginBottom: 7, textTransform: 'uppercase' }}>Revenue Chart</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 38 }}>
            {[35,52,40,68,55,88].map((h,i)=>(
              <div key={i} style={{ flex:1, height:h+'%', background:i===5?P:`${P}44`, borderRadius:'2px 2px 0 0', minHeight:3 }}/>
            ))}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', marginBottom: 7, textTransform: 'uppercase' }}>Recent</p>
          {[['Amaka C','₦185K','#22C55E'],['Kemi A','₦92K','#F59E0B'],['Dayo O','₦340K','#22C55E']].map(([n,a,c])=>(
            <div key={n as string} style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
              <span style={{ fontSize:9,color:'rgba(255,255,255,0.4)' }}>{n}</span>
              <span style={{ fontSize:9,fontWeight:700,color:c as string }}>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── CONTENT MAP ───────────────────────────────────────────
const SLIDES = [
  { id: 'signin',      duration: 9000,  Content: SignInContent },
  { id: 'customer',    duration: 12000, Content: AddCustomerContent },
  { id: 'appointment', duration: 15000, Content: AppointmentContent },
  { id: 'invoice',     duration: 14000, Content: CreateInvoiceContent },
  { id: 'sendemail',   duration: 13000, Content: SendInvoiceEmailContent },
  { id: 'payment',     duration: 8000,  Content: PaymentContent },
]
const N = SLIDES.length

// ── MAIN CAROUSEL ─────────────────────────────────────────
export default function AmanaDemo() {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goNext = () => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setActive(a => (a + 1) % N)
      setAnimating(false)
    }, 600)
  }

  useEffect(() => {
    timerRef.current = setTimeout(goNext, SLIDES[active].duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active])

  // For each slot: what slide index and what visual state
  const prev = (active - 1 + N) % N
  const next = (active + 1) % N

  // Panel style factory
  const panelStyle = (role: 'prev' | 'active' | 'next', exiting: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      borderRadius: 18,
      background: PANEL,
      border: `1px solid ${BORDER}`,
      padding: '24px 22px',
      overflow: 'hidden',
      transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
    }
    if (role === 'active') return {
      ...base,
      width: 'min(360px, 80vw)',
      left: '50%',
      transform: exiting
        ? 'translate(calc(-50% - 540px), -50%)'
        : 'translate(-50%, -50%)',
      zIndex: 20,
      opacity: exiting ? 0 : 1,
      boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.12)',
      filter: 'blur(0px) brightness(1)',
      maxHeight: '88%',
      overflowY: 'auto',
    }
    if (role === 'next') return {
      ...base,
      width: 280,
      left: '50%',
      transform: exiting
        ? 'translate(calc(-50% + 20px), -50%) scale(0.88)'
        : 'translate(calc(-50% + 260px), -50%) scale(0.88)',
      zIndex: 10,
      opacity: exiting ? 0.9 : 0.65,
      filter: exiting ? 'blur(0px) brightness(0.85)' : 'blur(1.5px) brightness(0.65)',
      boxShadow: 'none',
    }
    // prev
    return {
      ...base,
      width: 280,
      left: '50%',
      transform: exiting
        ? 'translate(calc(-50% - 540px), -50%) scale(0.88)'
        : 'translate(calc(-50% - 260px), -50%) scale(0.88)',
      zIndex: 10,
      opacity: exiting ? 0 : 0.55,
      filter: 'blur(2px) brightness(0.55)',
      boxShadow: 'none',
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.22)', background: DARK, boxShadow: '0 40px 100px rgba(0,0,0,0.7)', height: 'clamp(680px, 60vw, 580px)' }}>

      {/* Dashboard BG — bigger, more visible */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
        <DashBG />
      </div>

      {/* Subtle vignette only — no heavy dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.35) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* 3 panels */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        {/* Previous panel (left) */}
        {(() => {
          const { Content } = SLIDES[prev]
          return (
            <div style={panelStyle('prev', animating)}>
              <Content active={false} />
            </div>
          )
        })()}

        {/* Next panel (right) */}
        {(() => {
          const { Content } = SLIDES[next]
          return (
            <div style={panelStyle('next', animating)}>
              <Content active={false} />
            </div>
          )
        })()}

        {/* Active panel (center) — rendered last so it's on top */}
        {(() => {
          const { Content } = SLIDES[active]
          return (
            <div style={panelStyle('active', animating)}>
              <Content active={!animating} />
            </div>
          )
        })()}
      </div>

      {/* Dot indicators only — no labels */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 7, zIndex: 30 }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{ width: i === active ? 24 : 7, height: 7, borderRadius: 4, background: i === active ? '#A78BFA' : 'rgba(255,255,255,0.18)', transition: 'all 0.35s ease' }} />
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
