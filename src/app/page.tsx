'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const AmanaDemo = dynamic(() => import('@/components/AmanadDemo'), { ssr: false })

const FEATURE_GROUPS = [
  {
    group: 'Get Paid Faster',
    desc: 'Create professional invoices, share payment links instantly, track who has paid, and follow up automatically without chasing customers manually.',
    icon: '💰',
    cards: [
      { icon: '📄', title: 'Professional Invoicing', points: ['Create branded invoices', 'Send invoices instantly', 'Track invoice status'] },
      { icon: '💳', title: 'Secure Online Payments', points: ['Accept payments online', 'Receive payments faster', 'Automatic payment confirmation'] },
      { icon: '📊', title: 'Payment Tracking', points: ['See who has paid', 'See outstanding balances', 'Monitor overdue payments'] },
    ],
  },
  {
    group: 'Stay Organised',
    desc: 'Keep your customers, appointments, and business activities structured and easy to manage.',
    icon: '📋',
    cards: [
      { icon: '👥', title: 'Customer Management', points: ['Store customer information', 'Track payment history', 'Maintain customer relationships'] },
      { icon: '📅', title: 'Appointments & Bookings', points: ['Schedule appointments', 'Track upcoming bookings', 'Stay on top of customer meetings'] },
    ],
  },
  {
    group: 'Reduce Manual Work',
    desc: 'Spend less time following up and more time serving customers.',
    icon: '🔔',
    cards: [
      { icon: '⚡', title: 'Automated Reminders', points: ['Invoice reminders', 'Appointment reminders', 'Important business notifications'] },
    ],
  },
  {
    group: 'Understand Your Business',
    desc: 'Know what is working and make better business decisions with confidence.',
    icon: '📈',
    cards: [
      { icon: '📊', title: 'Business Reports', points: ['Revenue trends', 'Top earning services', 'Business performance insights'] },
    ],
  },
]

const FAQS = [
  { q: 'What is Amana?', a: 'Amana helps businesses manage customers, appointments, invoices, payments, and reminders from one place.' },
  { q: 'Who is Amana built for?', a: 'Freelancers, consultants, service providers, agencies, and growing businesses.' },
  { q: 'How can Amana help my business?', a: 'It helps you stay organized, get paid faster, and reduce manual work.' },
  { q: 'Do I need technical skills to use Amana?', a: 'No. Amana is designed to be simple and easy to use.' },
  { q: 'How long does setup take?', a: 'Most businesses can get started within a few minutes.' },
  { q: 'Is Amana free to use?', a: 'Early users can access Amana for free during the launch period.' },
  { q: 'Do I need a credit card to get started?', a: 'No credit card is required.' },
  { q: 'Can I create professional invoices?', a: 'Yes. Create and send invoices in minutes.' },
  { q: 'Can I send invoices directly to customers?', a: 'Yes. Invoices can be sent directly through email.' },
  { q: 'Can customers pay invoices online?', a: 'Yes. Customers can pay through secure payment links.' },
  { q: 'What payment methods are supported?', a: 'Supported methods include card payments, bank transfers, and USSD.' },
  { q: 'Can I track paid invoices?', a: 'Yes. Track paid, unpaid, and overdue invoices from your dashboard.' },
  { q: 'Can I see overdue payments?', a: 'Yes. Overdue invoices are clearly identified and flagged automatically.' },
  { q: 'Can I resend an invoice?', a: 'Coming Soon. You can currently copy and share the payment link. A dedicated resend button is being added.' },
  { q: 'Can I download invoices?', a: 'Yes. Invoices can be downloaded and shared as PDF.' },
  { q: 'Can I issue receipts?', a: 'Yes. Payment records are available in your dashboard.' },
  { q: 'Can I manage all customers in one place?', a: 'Yes. Customer records are stored in a central dashboard.' },
  { q: 'Can I view customer payment history?', a: 'Yes. Each customer profile contains their payment history.' },
  { q: 'Can I keep notes about customers?', a: 'Yes. Customer records can include notes and important details.' },
  { q: 'Can I search for customers?', a: 'Yes. Customer records can be searched and filtered.' },
  { q: 'Can I schedule appointments?', a: 'Yes. Create and manage appointments from your dashboard.' },
  { q: 'Can I track upcoming appointments?', a: 'Yes. View upcoming appointments in your calendar.' },
  { q: 'Can customers book appointments themselves?', a: 'Yes. Customers can book through your public booking page.' },
  { q: 'Can customers request appointment changes?', a: 'Coming Soon. Appointment change requests from customers are being added.' },
  { q: 'Can customers cancel appointments?', a: 'Coming Soon. Customer self-cancellation is being added to the booking workflow.' },
  { q: 'Will I be notified about new appointments?', a: 'Yes. Amana notifies you about all booking activity in real time.' },
  { q: 'Can I avoid double bookings?', a: 'Yes. Appointment scheduling automatically prevents time conflicts.' },
  { q: 'Does Amana send appointment reminders?', a: 'Yes. Automated reminders help reduce missed appointments.' },
  { q: 'Does Amana send invoice reminders?', a: 'Yes. Automated reminders help customers pay on time.' },
  { q: 'Can I automate follow-ups?', a: 'Yes. Amana reduces manual follow-up work through automation.' },
  { q: 'Can I track payment activity?', a: 'Yes. All payment activity is recorded and accessible in your dashboard.' },
  { q: 'Can I monitor business performance?', a: 'Yes. Reports provide insight into revenue and business activity.' },
  { q: 'Can I see revenue trends?', a: 'Yes. Revenue performance is available through your reports section.' },
  { q: 'Can I identify top-performing services?', a: 'Yes. Reports help highlight your best-performing services.' },
  { q: 'Can multiple team members use Amana?', a: 'Yes. Team access can be managed through workspace permissions.' },
  { q: 'Can I invite staff to my workspace?', a: 'Yes. Team members can be invited to collaborate with defined roles.' },
  { q: 'Can I manage multiple customers at scale?', a: 'Yes. Amana is designed to support growing businesses.' },
  { q: 'Is my business data secure?', a: 'Yes. Security and data protection are built into the platform.' },
  { q: 'Is customer information protected?', a: 'Yes. Customer records are stored securely.' },
  { q: 'Can I access Amana from anywhere?', a: 'Yes. Access your business wherever you have internet access.' },
  { q: 'Can I use Amana on mobile devices?', a: 'Yes. Amana works across desktop and mobile devices.' },
  { q: 'Can I use Amana on multiple devices?', a: 'Yes. Access your account across all supported devices.' },
  { q: 'Can I export my business records?', a: 'Yes. Customers, invoices, and payments can be exported to CSV.' },
  { q: 'Can I track all business activities?', a: 'Yes. Important business actions are recorded and organized.' },
  { q: 'Can I organize customers, appointments, and invoices together?', a: 'Yes. Everything is managed from one platform.' },
  { q: 'Will Amana help reduce manual administration?', a: 'Yes. Automation helps reduce repetitive tasks.' },
  { q: 'Will Amana help me get paid faster?', a: 'Yes. Invoices, payment links, and reminders all help speed up payments.' },
  { q: 'Will Amana help me stay organized?', a: 'Yes. Customer, appointment, and payment information stay in one place.' },
  { q: 'Can I grow my business with Amana?', a: 'Yes. Amana is built to support businesses as they grow.' },
  { q: 'Why should I choose Amana?', a: 'Because it brings customers, appointments, invoices, payments, and reminders together in one simple platform.' },
]


function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) { setErr('Please fill in all fields'); return }
    setSending(true); setErr('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, subject: 'Website enquiry' }),
      })
      const data = await res.json()
      if (data.success) { setSent(true); setName(''); setEmail(''); setMessage('') }
      else setErr(data.error || 'Something went wrong. Please try again.')
    } catch { setErr('Could not connect. Please try again.') }
    finally { setSending(false) }
  }

  if (sent) return (
    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '32px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>Message sent!</p>
      <p style={{ fontSize: 13, color: '#15803D' }}>We will get back to you soon.</p>
    </div>
  )

  return (
    <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '20px', border: '1px solid #E5E7EB', textAlign: 'left', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
        </div>
      </div>
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, resize: 'none', fontFamily: 'inherit', marginBottom: 10 }} />
      {err && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>{err}</p>}
      <button onClick={submit} disabled={sending} style={{ width: '100%', height: 42, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [visibleFaqs, setVisibleFaqs] = useState(7)

  const navLinks = [
    { label: 'Demo', href: '/demo' },
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: '#111827', overflowX: 'hidden' }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,26,110,0.98)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#7C3AED', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Amana</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map(l => <a key={l.label} href={l.href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none', padding: '6px 14px' }}>{l.label}</a>)}
            <Link href="/sign-in" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none', padding: '6px 14px' }}>Sign in</Link>
            <Link href="/sign-up" style={{ background: '#7C3AED', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '8px 18px', borderRadius: 8, marginLeft: 4 }}>Get Started Free</Link>
          </nav>
          <div style={{ display: 'none', alignItems: 'center' }} className="mobile-header-right">
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 22, height: 2, background: 'white', borderRadius: 2, display: 'block', transition: 'all 0.2s', transform: menuOpen && i===0 ? 'rotate(45deg) translate(4px,4px)' : menuOpen && i===2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none', opacity: (menuOpen && i===1) ? 0 : 1 }} />)}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid #E5E7EB', paddingBottom: 16 }}>
            {navLinks.map(l => <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', color: '#162272', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '12px 24px' }}>{l.label}</a>)}
            <div style={{ height: 1, background: '#E5E7EB', margin: '8px 24px' }} />
            <Link href="/sign-in" onClick={() => setMenuOpen(false)} style={{ display: 'block', color: '#162272', fontSize: 15, textDecoration: 'none', padding: '12px 24px' }}>Sign in</Link>
            <div style={{ padding: '8px 24px 0' }}>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} style={{ display: 'block', background: '#7C3AED', color: 'white', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '13px 20px', borderRadius: 10, textAlign: 'center' }}>Create Free Account</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{ background: '#0E1A6E', minHeight: 'clamp(520px,82vh,780px)', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>

        {/* Right side — image bleeds from edge, fades into background */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', zIndex: 0 }} className="hero-img-wrap">
          {/* The image itself — fills full height */}
          <img
            src="/hero-image.png"
            alt=""
            aria-hidden="true"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
          {/* Left fade — blends image into the dark background color */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '100%', background: 'linear-gradient(to right, #0E1A6E 0%, #0E1A6Ecc 30%, #0E1A6E77 55%, #0E1A6E22 75%, transparent 100%)', pointerEvents: 'none' }} />
          {/* Top fade */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '22%', background: 'linear-gradient(to bottom, #0E1A6E 0%, transparent 100%)', pointerEvents: 'none' }} />
          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', background: 'linear-gradient(to top, #0E1A6E 0%, transparent 100%)', pointerEvents: 'none' }} />
        </div>

        {/* Left side — text content, sits above image layer */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 540, marginLeft: 'clamp(0px, 8vw, 120px)' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 24, padding: '6px 16px', marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: 'pulse 2s infinite', flexShrink: 0 }} />
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Free access for all early users · No card required · Setup in minutes</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(38px,4.5vw,62px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 22 }}>
              <span style={{ color: 'white', display: 'block' }}>Run your business.</span>
              <span style={{ color: '#7C3AED', display: 'block' }}>Get paid faster.</span>
              <span style={{ color: 'white', display: 'block' }}>Stay organised.</span>
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: 'clamp(15px,1.4vw,17px)', color: 'rgba(255,255,255,0.58)', lineHeight: 1.8, marginBottom: 36, maxWidth: 460 }}>
              <strong>Amana helps you manage customers, schedule appointments, send professional invoices, track payments, and automate follow-ups. All in one place.</strong>
            </p>

            {/* CTAs */}
            <div className="hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/sign-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7C3AED', color: 'white', fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '14px 24px', borderRadius: 12, boxShadow: '0 4px 28px rgba(124,58,237,0.5)' }}>
                Create Free Account →
              </Link>
              <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.16)' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
                </span>
                Watch Demo
              </Link>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
          @media (max-width: 768px) {
            .hero-img-wrap { width: 100% !important; opacity: 0.18; }
          }
        `}</style>
      </section>


      {/* ── FEATURES ── */}
      <section id="features" style={{ background: '#FFFFFF', padding: '72px 20px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>
              Run Your Business With Confidence
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Amana helps you stay organized, get paid on time, and manage your daily operations with ease.
            </p>
          </div>

          {/* Row 1 — Get Paid Faster (3 cards, blue shadow) + Customer Management (purple shadow) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="cards-grid">
            {[
              { title: 'Professional Invoicing', points: ['Create branded invoices', 'Send invoices instantly', 'Track invoice status'], shadow: '0 4px 20px rgba(59,130,246,0.18)', border: '#DBEAFE', accent: '#3B82F6',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg> },
              { title: 'Secure Online Payments', points: ['Accept card, USSD & transfer', 'Receive payments faster', 'Automatic confirmation'], shadow: '0 4px 20px rgba(59,130,246,0.18)', border: '#DBEAFE', accent: '#3B82F6',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
              { title: 'Payment Tracking', points: ['See who has paid', 'See outstanding balances', 'Monitor overdue payments'], shadow: '0 4px 20px rgba(59,130,246,0.18)', border: '#DBEAFE', accent: '#3B82F6',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
              { title: 'Customer Management', points: ['Store customer info', 'Track payment history', 'Maintain relationships'], shadow: '0 4px 20px rgba(124,58,237,0.18)', border: '#EDE9FE', accent: '#7C3AED',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.74"/></svg> },
            ].map(card => (
              <div key={card.title} style={{ background: '#F9FAFB', borderRadius: 14, padding: '24px 20px', border: `1px solid ${card.border}`, boxShadow: card.shadow }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${card.accent}18`, border: `1.5px solid ${card.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{card.icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{card.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {card.points.map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5" stroke={card.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Row 2 — Appointments (purple) + Reminders (amber) + Reports + Anywhere (green) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 20 }} className="cards-grid">
            {[
              { title: 'Appointment Booking', points: ['Schedule appointments', 'Track upcoming bookings', 'Public booking page'], shadow: '0 4px 20px rgba(124,58,237,0.18)', border: '#EDE9FE', accent: '#7C3AED',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
              { title: 'Automated Reminders', points: ['Invoice reminders', 'Appointment reminders', 'No manual follow-up'], shadow: '0 4px 20px rgba(245,158,11,0.18)', border: '#FEF3C7', accent: '#F59E0B',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
              { title: 'Business Reports', points: ['Revenue trends', 'Top earning services', 'Performance insights'], shadow: '0 4px 20px rgba(34,197,94,0.18)', border: '#DCFCE7', accent: '#22C55E',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
              { title: 'Access Anywhere', points: ['Manage on the go', 'Any device, any time', 'Always stay organised'], shadow: '0 4px 20px rgba(34,197,94,0.18)', border: '#DCFCE7', accent: '#22C55E',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg> },
            ].map(card => (
              <div key={card.title} style={{ background: '#F9FAFB', borderRadius: 14, padding: '24px 20px', border: `1px solid ${card.border}`, boxShadow: card.shadow }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${card.accent}18`, border: `1.5px solid ${card.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{card.icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{card.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {card.points.map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5" stroke={card.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 0 }}>
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .badge-grid { grid-template-columns: 1fr 1fr !important; }
            .cards-grid { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 480px) {
            .badge-grid { grid-template-columns: 1fr !important; }
            .cards-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#0E1A6E', padding: '44px 20px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52, alignItems: 'center' }} className="cta-grid">
          {/* Left — headline and benefits */}
          <div className="cta-text">
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.15 }}>
              Create your free<br />account today
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 28, lineHeight: 1.75 }}>
              Join thousands of business owners who get paid faster with Amana. No credit card required.
            </p>
            {/* Watch Full Demo button */}
            <Link href="/demo"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#7C3AED', color: 'white', textDecoration: 'none', padding: '16px 28px', borderRadius: 14, fontSize: 16, fontWeight: 800, marginBottom: 24, boxShadow: '0 8px 28px rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
              </span>
              Watch Full Demo
            </Link>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.6 }}>
              Not sure yet? Watch the demo to see exactly how Amana works before you sign up.
            </p>

            {/* Two trust badges — side by side, compact */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 140 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" stroke="rgba(255,255,255,0.8)"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 1 }}>No card required</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Start completely free</p>
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', alignSelf: 'stretch', flexShrink: 0 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 140 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.74"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 1 }}>Free access for early users</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Be among the first to try Amana</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — signup form card */}
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, background: '#7C3AED', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#7C3AED' }}>Amana</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Create your free account</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Full Name</label>
                <div style={{ height: 42, border: '1px solid #E5E7EB', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', background: '#F9FAFB' }}>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>Your full name</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Email Address</label>
                <div style={{ height: 42, border: '1px solid #E5E7EB', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', background: '#F9FAFB' }}>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>you@example.com</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Password</label>
                <div style={{ height: 42, border: '1px solid #E5E7EB', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', background: '#F9FAFB' }}>
                  <span style={{ fontSize: 16, color: '#D1D5DB', letterSpacing: 3 }}>{'●'.repeat(8)}</span>
                </div>
              </div>
              <Link href="/sign-up" style={{ display: 'block', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', textDecoration: 'none', textAlign: 'center', padding: '13px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, marginTop: 4, boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
                Create Free Account →
              </Link>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                No credit card required · Free access for all early users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: '#F3F4F6', padding: '52px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: '#111827' }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FAQS.slice(0, visibleFaqs).map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: 22, color: '#7C3AED', flexShrink: 0, transition: 'transform 0.2s', display: 'inline-block', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && <div style={{ padding: '0 18px 14px', fontSize: 13, color: '#6B7280', lineHeight: 1.7, borderTop: '1px solid #F3F4F6' }}>{faq.a}</div>}
              </div>
            ))}
          </div>

          {/* Show more / Show less controls */}
          <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {visibleFaqs < FAQS.length && (
              <button
                onClick={() => setVisibleFaqs(v => Math.min(v + 10, FAQS.length))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 600, color: '#7C3AED', cursor: 'pointer' }}>
                Show more questions
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            )}
            {visibleFaqs > 7 && (
              <button
                onClick={() => { setVisibleFaqs(7); setOpenFaq(null) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12, fontWeight: 500, color: '#9CA3AF', cursor: 'pointer' }}>
                Show less
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>
              </button>
            )}
            <p style={{ fontSize: 11, color: '#C7D2FE' }}>
              Showing {Math.min(visibleFaqs, FAQS.length)} of {FAQS.length} questions
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: '#FFFFFF', padding: '52px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800, color: '#111827', marginBottom: 6 }}>Get in touch</h2>
          <div style={{ background: 'white', borderRadius: 14, padding: '20px', border: 'none', textAlign: 'left', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Name</label>
                <input placeholder="Your name" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Email</label>
                <input type="email" placeholder="you@example.com" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <textarea placeholder="How can we help?" rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit', marginBottom: 10 }} />

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#162272', color: 'white', padding: '40px 20px 24px', borderTop: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* 4 columns on desktop, stacked on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 28 }} className="footer-grid" id="footer-cols">

            {/* Col 1 — Brand */}
            <div className="footer-brand-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, background: '#7C3AED', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 24 }}>Amana</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 14 }}>
                The all-in-one business platform for small business growth.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['#1DA1F2','#0A66C2','#E4405F','#25D366'].map((c, i) => (
                  <a key={i} href="#" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Sub-columns wrapper — on mobile these 3 sit side by side */}
            <div className="footer-sub-cols" style={{ display: 'contents' }}>

            {/* Col 2 — Support */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.5)' }}>Support</p>
              {[
                { icon: '✉', l: 'Email', v: 'support@amana.app' },
                { icon: '🕐', l: 'Support Hours', v: '9am – 6pm WAT' },
                { icon: '📍', l: 'Location', v: 'Lagos, Nigeria' },
              ].map(c => (
                <div key={c.l} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 1 }}>{c.l}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{c.v}</p>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 4 }}>
                {[['Help Center','#contact'],['Business Support','#contact']].map(([l,h]) => (
                  <p key={l} style={{ marginBottom: 6 }}>
                    <Link href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>{l}</Link>
                  </p>
                ))}
              </div>
            </div>

            {/* Col 3 — Company */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.5)' }}>Company</p>
              {[['Home','/'],['About','#features'],['Terms & Conditions','/terms'],['Privacy Policy','/privacy'],['Contact','#contact']].map(([l,h]) => (
                <p key={l} style={{ marginBottom: 8 }}>
                  <Link href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>{l}</Link>
                </p>
              ))}
            </div>

            {/* Col 4 — Product */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.5)' }}>Product</p>
              {[['Invoices','/dashboard/invoices'],['Payments','/dashboard/payments'],['Customers','/dashboard/customers'],['Appointments','/dashboard/appointments'],['Reports','/dashboard/reports']].map(([l,h]) => (
                <p key={l} style={{ marginBottom: 8 }}>
                  <Link href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>{l}</Link>
                </p>
              ))}
            </div>

            </div>{/* end footer-sub-cols */}
          </div>

          {/* Bottom bar — copyright + Terms + Privacy only */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {[['Terms','/terms'],['Privacy','/privacy']].map(([l,h]) => (
                <Link key={l} href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-header-right { display: none !important; }
        .cta-grid { grid-template-columns: 1fr 1fr !important; }
        .cta-text { text-align: left !important; }
        .footer-grid { grid-template-columns: repeat(4,1fr) !important; }
        .hero-btns { flex-direction: row; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-header-right { display: flex !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          .cta-text { text-align: center !important; }
          .cta-text a { display: inline-block !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-brand-col { grid-column: 1 / -1; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px; }
          .footer-sub-cols { display: grid !important; grid-template-columns: repeat(3,1fr) !important; gap: 16px; grid-column: 1 / -1; }
          .hero-btns { flex-direction: column !important; align-items: flex-start !important; }
          .cards-grid { grid-template-columns: repeat(2,1fr) !important; }
        }

        @media (max-width: 480px) {
          .footer-sub-cols { grid-template-columns: repeat(3,1fr) !important; }
        }
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}