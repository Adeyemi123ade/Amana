'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── TYPES ───────────────────────────────────────────
type Step = 0 | 1 | 2 | 3 | 4

// ─── DEMO DATA ────────────────────────────────────────
const DEMO = {
  email: 'sulaimon@johnsphotography.ng',
  password: '••••••••••',
  customer: { name: 'Amaka Chisom', email: 'amaka@email.com', phone: '+234 802 345 6789', address: '14 Allen Avenue, Ikeja, Lagos' },
  invoice: { item: 'Wedding Photography – Full Day', qty: 1, price: '₦185,000' },
  appointment: { service: 'Product Shoot – 4 Hours', date: '20 Jun 2026', time: '10:00 AM', notes: 'Studio session, 3 outfit changes' },
}

// ─── STATS that animate during the demo ──────────────
const BASE_STATS = { revenue: 1340000, invoices: 23, customers: 47, appointments: 8, payments: 19 }

const FAQS = [
  { q: 'What does Amana do?', a: 'Amana is a complete business management platform. Create invoices, track payments, manage customers, schedule appointments, send reminders — all from one dashboard.' },
  { q: 'Is Amana free?', a: 'Yes. Amana is completely free for all early users. All features available at no cost during the early access period.' },
  { q: 'Who can use Amana?', a: 'Any small business owner or freelancer — photographers, coaches, hair stylists, event planners, consultants, caterers, and many more.' },
  { q: 'Can I track who has paid?', a: 'Yes. Every invoice shows live payment status — Paid, Unpaid, or Overdue — updated the moment a customer pays.' },
  { q: 'Does it work on mobile?', a: 'Yes. Amana is fully responsive and works on all smartphones and tablets.' },
  { q: 'Can I use it outside Nigeria?', a: 'Yes. Multi-currency support for Nigeria, UAE, UK, US, Ghana, Kenya, South Africa and more.' },
]

// ─── TYPING HOOK ─────────────────────────────────────
function useTyping(target: string, active: boolean, speed = 38) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!active) { setText(''); return }
    let i = 0
    const interval = setInterval(() => {
      setText(target.slice(0, i + 1))
      i++
      if (i >= target.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [target, active, speed])
  return text
}

// ─── COLOUR TOKENS ────────────────────────────────────
const C = {
  bg: '#0c0720',
  panel: 'rgba(18,10,48,0.92)',
  border: 'rgba(124,58,237,0.25)',
  accent: '#7C3AED',
  accentLight: '#A78BFA',
  success: '#22C55E',
  warn: '#F59E0B',
  danger: '#EF4444',
  text: '#F1F0FF',
  muted: 'rgba(241,240,255,0.45)',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
}

const field: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8,
  border: '1px solid rgba(124,58,237,0.35)', background: 'rgba(255,255,255,0.05)',
  color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
}
const label: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }
const btn = (col = C.accent): React.CSSProperties => ({
  width: '100%', height: 42, background: col, border: 'none', borderRadius: 8,
  color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
})

// ─── STEP SCREENS ─────────────────────────────────────

function SignInScreen({ active }: { active: boolean }) {
  const email = useTyping(DEMO.email, active, 35)
  const [showPass, setShowPass] = useState(false)
  const [btnState, setBtnState] = useState<'idle' | 'loading' | 'done'>('idle')

  useEffect(() => {
    if (!active) { setShowPass(false); setBtnState('idle'); return }
    const t1 = setTimeout(() => setShowPass(true), DEMO.email.length * 35 + 400)
    const t2 = setTimeout(() => setBtnState('loading'), DEMO.email.length * 35 + 1200)
    const t3 = setTimeout(() => setBtnState('done'), DEMO.email.length * 35 + 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [active])

  return (
    <div style={{ padding: '28px 28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
        <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white" /></svg>
        </div>
        <span style={{ color: C.text, fontWeight: 800, fontSize: 15 }}>Amana</span>
      </div>
      <p style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Welcome back</p>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Sign in to your business account</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={label}>Email address</label>
          <input style={field} value={email} readOnly />
        </div>
        <div>
          <label style={label}>Password</label>
          <input style={field} type="password" value={showPass ? '••••••••••' : ''} readOnly />
        </div>
        <button style={{ ...btn(), marginTop: 4, background: btnState === 'done' ? C.success : btnState === 'loading' ? C.accent + 'cc' : C.accent }}>
          {btnState === 'loading' ? <><span style={{ width: 12, height: 12, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Signing in...</> : btnState === 'done' ? '✓ Signed in' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}

function AddCustomerScreen({ active }: { active: boolean }) {
  const name = useTyping(DEMO.customer.name, active, 40)
  const email = useTyping(DEMO.customer.email, active && name.length === DEMO.customer.name.length, 40)
  const phone = useTyping(DEMO.customer.phone, active && email.length === DEMO.customer.email.length, 35)
  const address = useTyping(DEMO.customer.address, active && phone.length === DEMO.customer.phone.length, 30)
  const allDone = address.length === DEMO.customer.address.length
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!active) { setSaved(false); return }
    if (allDone) {
      const t = setTimeout(() => setSaved(true), 600)
      return () => clearTimeout(t)
    }
  }, [active, allDone])

  return (
    <div style={{ padding: '22px 28px' }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Add Customer</p>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>Save customer details for future invoices and appointments</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={label}>Full Name</label>
          <input style={field} value={name} readOnly />
        </div>
        <div>
          <label style={label}>Email Address</label>
          <input style={field} value={email} readOnly />
        </div>
        <div>
          <label style={label}>Phone Number</label>
          <input style={field} value={phone} readOnly />
        </div>
        <div>
          <label style={label}>Address</label>
          <input style={field} value={address} readOnly />
        </div>
      </div>
      <button style={{ ...btn(saved ? C.success : allDone ? C.accent : 'rgba(124,58,237,0.4)'), transition: 'background 0.3s' }}>
        {saved ? '✓ Customer Saved' : allDone ? 'Save Customer' : 'Save Customer'}
      </button>
    </div>
  )
}

function CreateInvoiceScreen({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!active) { setPhase(0); return }
    const delays = [600, 1200, 1900, 2600, 3400]
    const timers = delays.map((d, i) => setTimeout(() => setPhase(i + 1), d))
    return () => timers.forEach(clearTimeout)
  }, [active])

  return (
    <div style={{ padding: '22px 28px' }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Create Invoice</p>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>Invoice for {DEMO.customer.name}</p>
      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: C.muted }}>Customer</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text, opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.5s' }}>{DEMO.customer.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: C.muted }}>Service</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.text, opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.5s' }}>{DEMO.invoice.item}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: C.muted }}>Due Date</span>
          <span style={{ fontSize: 12, color: C.text, opacity: phase >= 3 ? 1 : 0, transition: 'opacity 0.5s' }}>30 Jun 2026</span>
        </div>
        <div style={{ borderTop: `1px solid ${C.cardBorder}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Total Amount</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: C.accentLight, opacity: phase >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}>{DEMO.invoice.price}</span>
        </div>
      </div>
      <button style={{ ...btn(phase >= 4 ? C.accent : 'rgba(124,58,237,0.3)'), transition: 'background 0.4s' }}>
        {phase >= 5 ? '✓ Invoice Sent via Email' : phase >= 4 ? 'Send Invoice' : 'Create Invoice'}
      </button>
    </div>
  )
}

function AppointmentScreen({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!active) { setPhase(0); return }
    const delays = [500, 1100, 1700, 2400, 3200]
    const timers = delays.map((d, i) => setTimeout(() => setPhase(i + 1), d))
    return () => timers.forEach(clearTimeout)
  }, [active])

  return (
    <div style={{ padding: '22px 28px' }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Book Appointment</p>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>Schedule a session for your customer</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'Customer', val: DEMO.customer.name, phase: 1 },
          { label: 'Service', val: DEMO.appointment.service, phase: 2 },
          { label: 'Date', val: DEMO.appointment.date, phase: 3 },
          { label: 'Time', val: DEMO.appointment.time, phase: 3 },
        ].map(f => (
          <div key={f.label}>
            <label style={label}>{f.label}</label>
            <div style={{ ...field, display: 'flex', alignItems: 'center', opacity: phase >= f.phase ? 1 : 0.15, transition: 'opacity 0.5s' }}>
              <span style={{ fontSize: 12, color: C.text }}>{phase >= f.phase ? f.val : ''}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Notes</label>
        <div style={{ ...field, height: 52, display: 'flex', alignItems: 'center', opacity: phase >= 4 ? 1 : 0.15, transition: 'opacity 0.5s' }}>
          <span style={{ fontSize: 12, color: C.text }}>{phase >= 4 ? DEMO.appointment.notes : ''}</span>
        </div>
      </div>
      <button style={{ ...btn(phase >= 4 ? C.accent : 'rgba(124,58,237,0.3)'), transition: 'background 0.4s' }}>
        {phase >= 5 ? '✓ Appointment Booked' : 'Book Appointment'}
      </button>
    </div>
  )
}

function PaymentScreen({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!active) { setPhase(0); return }
    const delays = [400, 1000, 1800, 2800]
    const timers = delays.map((d, i) => setTimeout(() => setPhase(i + 1), d))
    return () => timers.forEach(clearTimeout)
  }, [active])

  return (
    <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: phase >= 2 ? 'rgba(34,197,94,0.15)' : C.card,
        border: `3px solid ${phase >= 2 ? C.success : C.cardBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, transition: 'all 0.5s',
      }}>
        {phase >= 2
          ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
          : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
        }
      </div>
      <p style={{ fontSize: 17, fontWeight: 700, color: phase >= 2 ? C.success : C.text, marginBottom: 4, transition: 'color 0.4s' }}>
        {phase >= 2 ? 'Payment Received!' : 'Awaiting Payment'}
      </p>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 22, textAlign: 'center' }}>
        {phase >= 2 ? `${DEMO.customer.name} paid via Paystack` : 'Customer is being notified'}
      </p>
      <div style={{ width: '100%', background: C.card, borderRadius: 12, border: `1px solid ${C.cardBorder}`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Customer', val: DEMO.customer.name, phase: 1 },
          { label: 'Invoice', val: 'INV-0024', phase: 1 },
          { label: 'Amount', val: DEMO.invoice.price, phase: 2, color: C.accentLight },
          { label: 'Status', val: '✓ PAID', phase: 2, color: C.success },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: phase >= row.phase ? 1 : 0.2, transition: 'opacity 0.5s' }}>
            <span style={{ fontSize: 12, color: C.muted }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: (row as any).color || C.text }}>{phase >= row.phase ? row.val : '—'}</span>
          </div>
        ))}
      </div>
      {phase >= 3 && (
        <div style={{ marginTop: 16, fontSize: 11, color: C.success, textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
          Dashboard revenue updated · Invoice marked Paid
        </div>
      )}
    </div>
  )
}

// ─── DASHBOARD BACKGROUND ────────────────────────────
function DashboardBG({ stats }: { stats: typeof BASE_STATS }) {
  const fmt = (n: number) => n >= 1000000 ? '₦' + (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? '₦' + (n / 1000).toFixed(0) + 'K' : String(n)

  const statCards = [
    { label: 'Revenue Today', val: fmt(stats.revenue), color: C.success, icon: '₦' },
    { label: 'Invoices', val: String(stats.invoices), color: C.accentLight, icon: '📄' },
    { label: 'Customers', val: String(stats.customers), color: C.warn, icon: '👥' },
    { label: 'Appointments', val: String(stats.appointments), color: '#3B82F6', icon: '📅' },
    { label: 'Payments', val: String(stats.payments), color: C.success, icon: '💰' },
  ]

  const recent = [
    { name: 'Amaka Chisom', type: 'Invoice', amt: '₦185,000', status: 'Paid', statusColor: C.success },
    { name: 'Kemi Adeyemi', type: 'Invoice', amt: '₦92,000', status: 'Unpaid', statusColor: C.warn },
    { name: 'Dayo Okonkwo', type: 'Appointment', amt: '10:00 AM', status: 'Confirmed', statusColor: '#3B82F6' },
    { name: 'Tunde Bello', type: 'Payment', amt: '₦340,000', status: 'Paid', statusColor: C.success },
  ]

  return (
    <div style={{ width: '100%', height: '100%', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: C.accent, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white" /></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>John's Photography</span>
        </div>
        <span style={{ fontSize: 11, color: C.muted }}>Good morning, John 👋</span>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '10px 10px' }}>
            <p style={{ fontSize: 9, color: C.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</p>
            <p style={{ fontSize: 15, fontWeight: 900, color: s.color, transition: 'all 0.5s', lineHeight: 1 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Chart + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
        {/* Chart */}
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: 9, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>Revenue — 6 Months</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 52 }}>
            {[38, 55, 42, 70, 58, 88].map((h, i) => (
              <div key={i} style={{ flex: 1, height: h + '%', background: i === 5 ? C.accent : `${C.accent}44`, borderRadius: '3px 3px 0 0', minHeight: 4 }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
              <p key={m} style={{ flex: 1, fontSize: 8, color: C.muted, textAlign: 'center' }}>{m}</p>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '12px 14px', overflow: 'hidden' }}>
          <p style={{ fontSize: 9, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>Recent Activity</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {recent.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${C.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: C.accentLight, flexShrink: 0 }}>{r.name[0]}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                    <p style={{ fontSize: 8, color: C.muted }}>{r.type}</p>
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{r.amt}</p>
                  <p style={{ fontSize: 8, color: r.statusColor, fontWeight: 600 }}>{r.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── STEP LABELS ──────────────────────────────────────
const STEP_LABELS = ['Sign In', 'Add Customer', 'Create Invoice', 'Book Appointment', 'Payment Received']
const STEP_DURATION = [5000, 6000, 6000, 6500, 5500]

// ─── MAIN DEMO COMPONENT ─────────────────────────────
function AmanaDemoPlayer() {
  const [step, setStep] = useState<Step>(0)
  const [exiting, setExiting] = useState(false)
  const [stats, setStats] = useState(BASE_STATS)
  const stepRef = useRef<Step>(0)

  useEffect(() => {
    const advance = () => {
      setExiting(true)
      setTimeout(() => {
        const next = ((stepRef.current + 1) % 5) as Step
        stepRef.current = next
        setStep(next)
        setExiting(false)
        // Update stats on relevant steps
        if (next === 2) setStats(s => ({ ...s, customers: s.customers + 1 }))
        if (next === 3) setStats(s => ({ ...s, invoices: s.invoices + 1 }))
        if (next === 4) setStats(s => ({ ...s, appointments: s.appointments + 1 }))
        if (next === 0) setStats(s => ({ ...s, payments: s.payments + 1, revenue: s.revenue + 185000 }))
      }, 600)
    }

    const timer = setTimeout(advance, STEP_DURATION[step])
    return () => clearTimeout(timer)
  }, [step])

  const screens = [
    <SignInScreen key="signin" active={step === 0 && !exiting} />,
    <AddCustomerScreen key="customer" active={step === 1 && !exiting} />,
    <CreateInvoiceScreen key="invoice" active={step === 2 && !exiting} />,
    <AppointmentScreen key="appointment" active={step === 3 && !exiting} />,
    <PaymentScreen key="payment" active={step === 4 && !exiting} />,
  ]

  return (
    <div style={{ position: 'relative', width: '100%', height: 480, borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.bg, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
      {/* Dashboard background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <DashboardBG stats={stats} />
      </div>

      {/* Stack of upcoming screens (behind) */}
      {[2, 1].map(offset => {
        const behindStep = ((step + offset) % 5) as Step
        return (
          <div key={offset} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: `translate(calc(-50% + ${offset * 14}px), calc(-50% + ${offset * 10}px))`,
            width: 340, minHeight: 260,
            background: 'rgba(18,8,50,0.6)',
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            backdropFilter: 'blur(8px)',
            opacity: 0.35 - offset * 0.1,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{STEP_LABELS[behindStep]}</p>
            </div>
          </div>
        )
      })}

      {/* Active screen */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(calc(-50% + ${exiting ? '-120%' : '0'}), -50%)`,
        width: 360,
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        backdropFilter: 'blur(24px)',
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${C.border}`,
        transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
        minHeight: 280,
        zIndex: 10,
      }}>
        {screens[step]}
      </div>

      {/* Step indicator */}
      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 20 }}>
        {STEP_LABELS.map((label, i) => (
          <button key={i} onClick={() => { setExiting(true); setTimeout(() => { stepRef.current = i as Step; setStep(i as Step); setExiting(false) }, 300) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: i === step ? C.accent : 'rgba(255,255,255,0.08)',
              border: `1px solid ${i === step ? C.accent : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 20, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.3s',
            }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: i === step ? 'white' : C.muted }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.06)', zIndex: 20 }}>
        <div key={step} style={{ height: '100%', background: C.accent, borderRadius: 2, animation: `progress ${STEP_DURATION[step]}ms linear forwards` }} />
      </div>
    </div>
  )
}

// ─── FULL LANDING PAGE ────────────────────────────────
const FEATURES = [
  { icon: '📄', title: 'Invoices in Seconds', desc: 'Generate professional invoices instantly. Send directly to customers by email with a payment link.' },
  { icon: '💰', title: 'Real-Time Payment Tracking', desc: 'Know exactly who has paid, who owes, and what is overdue the moment it changes.' },
  { icon: '👥', title: 'Customer Management', desc: 'Full customer records — contact details, payment history, appointments, notes.' },
  { icon: '📅', title: 'Appointments & Bookings', desc: 'Public booking page. Customers self-schedule. Automated reminders reduce no-shows.' },
  { icon: '🔔', title: 'Automated Follow-Ups', desc: 'Payment reminders, appointment confirmations, and overdue alerts — all automatic.' },
  { icon: '📊', title: 'Business Reports', desc: 'Weekly revenue trends, top-earning services, and growth analytics at a glance.' },
  { icon: '💳', title: 'Paystack Payments', desc: 'Customers pay by card, USSD, or bank transfer. Invoice marks paid automatically.' },
  { icon: '🌍', title: 'Multi-Country Support', desc: 'Works in Nigeria, UAE, UK, US, Ghana, Kenya and across Africa. Multi-currency built in.' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const navLinks = [{ label: 'Demo', href: '#demo' }, { label: 'Features', href: '#features' }, { label: 'FAQ', href: '#faq' }, { label: 'Contact', href: '#contact' }]

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: '#111827', overflowX: 'hidden' }}>

      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,7,32,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#7C3AED', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white" /></svg>
            </div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Amana</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map(l => <a key={l.label} href={l.href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none', padding: '6px 14px' }}>{l.label}</a>)}
            <Link href="/sign-in" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none', padding: '6px 14px' }}>Sign in</Link>
            <Link href="/sign-up" style={{ background: '#7C3AED', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '8px 18px', borderRadius: 8, marginLeft: 4 }}>Get Started Free</Link>
          </nav>
          <div style={{ display: 'none', alignItems: 'center', gap: 10 }} className="mobile-header-right">
            <Link href="/sign-up" style={{ background: '#7C3AED', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>Get Started</Link>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 22, height: 2, background: 'white', borderRadius: 2, display: 'block', transition: 'all 0.2s', transform: menuOpen && i === 0 ? 'rotate(45deg) translate(4px,4px)' : menuOpen && i === 2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none', opacity: menuOpen && i === 1 ? 0 : 1 }} />)}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: 'rgba(12,7,32,0.99)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
            {navLinks.map(l => <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 15, textDecoration: 'none', padding: '12px 24px' }}>{l.label}</a>)}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 24px' }} />
            <Link href="/sign-in" onClick={() => setMenuOpen(false)} style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 15, textDecoration: 'none', padding: '12px 24px' }}>Sign in</Link>
            <div style={{ padding: '8px 24px 0' }}>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} style={{ display: 'block', background: '#7C3AED', color: 'white', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '13px 20px', borderRadius: 10, textAlign: 'center' }}>Create Free Account</Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#0c0720 0%,#160d3a 50%,#0c0720 100%)', padding: '80px 20px 72px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }} className="hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 24, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#A78BFA', fontSize: 13, fontWeight: 500 }}>Free for all early users · No credit card needed</span>
            </div>
            <h1 style={{ fontSize: 'clamp(34px,4vw,56px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 18, letterSpacing: -1 }}>
              Run your business.<br />
              <span style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get paid faster.</span><br />
              Stay organised.
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 440, lineHeight: 1.75, marginBottom: 32 }}>
              The all-in-one platform for small businesses to invoice customers, track payments, manage appointments, and automate reminders.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
              <Link href="/sign-up" style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 28px', borderRadius: 12, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                Create Free Account
              </Link>
              <a href="#demo" style={{ background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '13px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
                Watch Demo →
              </a>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[{ n: '12,000+', l: 'Businesses' }, { n: '840K+', l: 'Invoices Sent' }, { n: '6 hrs', l: 'Saved Per Week' }].map(s => (
                <div key={s.l}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 1 }}>{s.n}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Mini dashboard preview for hero */}
          <div className="hero-visual" style={{ position: 'relative', height: 380 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(124,58,237,0.05)', borderRadius: 18, border: '1px solid rgba(124,58,237,0.2)', overflow: 'hidden', opacity: 0.7 }}>
              <DashboardBG stats={BASE_STATS} />
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 260, background: 'rgba(12,7,32,0.92)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 14, padding: '18px 20px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 12 }}>Invoice Sent 📨</p>
              {[{ l: 'Customer', v: 'Amaka Chisom' }, { l: 'Amount', v: '₦185,000' }, { l: 'Status', v: '⏳ Awaiting Payment' }].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.l}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ background: '#7C3AED', borderRadius: 8, padding: '8px 12px', textAlign: 'center', marginTop: 12, fontSize: 12, fontWeight: 600, color: 'white' }}>Pay ₦185,000 →</div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <section id="demo" style={{ background: '#0c0720', padding: '72px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Live Demonstration</p>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: 'white', marginBottom: 12 }}>Watch Amana in action</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto' }}>
              See how a business owner signs in, adds a customer, creates an invoice, books an appointment, and receives payment — automatically.
            </p>
          </div>
          <AmanaDemoPlayer />
        </div>
      </section>

      {/* FOR WHO */}
      <section style={{ background: '#F9FAFB', padding: '60px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 800, color: '#111827', marginBottom: 28 }}>Built for every small business owner</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {['Photographers', 'Hair Stylists', 'Coaches & Trainers', 'Event Planners', 'Caterers', 'Consultants', 'Real Estate Agents', 'Freelancers', 'Tailors & Fashion', 'Mechanics & Contractors', 'Healthcare Providers', 'Accountants & Lawyers'].map(item => (
              <span key={item} style={{ background: 'white', borderRadius: 20, padding: '7px 14px', fontSize: 13, fontWeight: 500, color: '#374151', border: '1px solid #E5E7EB' }}>✓ {item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: 'white', padding: '72px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>Everything your business needs</h2>
            <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>One platform to run your operations, get paid, and grow.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#F9FAFB', borderRadius: 14, padding: '22px 20px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '72px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: 'white', marginBottom: 12 }}>Start for free today</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 28, lineHeight: 1.7 }}>Join thousands of business owners who get paid faster with Amana. No credit card required.</p>
          <Link href="/sign-up" style={{ background: 'white', color: '#7C3AED', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 32px', borderRadius: 12, display: 'inline-block' }}>Create Free Account</Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: '#F9FAFB', padding: '72px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#111827' }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: 20, color: '#7C3AED', flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && <div style={{ padding: '0 18px 16px', fontSize: 13, color: '#6B7280', lineHeight: 1.7, borderTop: '1px solid #F3F4F6' }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ background: 'white', padding: '72px 20px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 800, color: '#111827', marginBottom: 8 }}>Get in touch</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 6 }}>We respond within 24 hours.</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#7C3AED', marginBottom: 28 }}>support@amana.app</p>
          <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '24px', border: '1px solid #F3F4F6', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name</label>
                <input placeholder="Your name" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
                <input type="email" placeholder="you@example.com" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white' }} />
              </div>
            </div>
            <textarea placeholder="How can we help?" rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'none', background: 'white', fontFamily: 'inherit', marginBottom: 12 }} />
            <button style={{ width: '100%', height: 44, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Send Message</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0c0720', color: 'white', padding: '60px 20px 32px', borderTop: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: '#7C3AED', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white" /></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 17, color: 'white' }}>Amana</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20, maxWidth: 220 }}>The all-in-one business platform for small businesses worldwide.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#1DA1F2', '#0A66C2', '#E4405F', '#25D366'].map((color, i) => (
                  <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, opacity: 0.8 }} />
                  </a>
                ))}
              </div>
            </div>
            {/* Contact */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Contact Us</p>
              {[
                { icon: '✉', label: 'Email', val: 'support@amana.app' },
                { icon: '📞', label: 'Support Hours', val: '9am – 6pm WAT' },
                { icon: '📍', label: 'Location', val: 'Lagos, Nigeria' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{c.label}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{c.val}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Pages */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Pages</p>
              {[['Home', '/'], ['Demo', '#demo'], ['Features', '#features'], ['FAQ', '#faq'], ['Terms & Conditions', '/terms'], ['Privacy Policy', '/privacy']].map(([l, h]) => (
                <p key={l} style={{ marginBottom: 10 }}><Link href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{l}</Link></p>
              ))}
            </div>
            {/* Account */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Account</p>
              {[['Sign Up — Free', '/sign-up'], ['Sign In', '/sign-in']].map(([l, h]) => (
                <p key={l} style={{ marginBottom: 10 }}><Link href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{l}</Link></p>
              ))}
              <Link href="/sign-up" style={{ display: 'block', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', textDecoration: 'none', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center', marginTop: 16 }}>
                Get Started Free →
              </Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 18 }}>
              {[['Terms', '/terms'], ['Privacy', '/privacy'], ['Contact', '#contact']].map(([l, h]) => (
                <Link key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-header-right { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-header-right { display: flex !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes progress { from { width:0; } to { width:100%; } }
      `}</style>
    </div>
  )
}
