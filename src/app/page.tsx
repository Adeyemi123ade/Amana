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

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const navLinks = [
    { label: 'Demo', href: '#demo' },
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: '#111827', overflowX: 'hidden' }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,7,32,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
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

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(160deg,#160b35 0%,#1e1048 50%,#160b35 100%)', padding: '88px 20px 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 24, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#A78BFA', fontSize: 13, fontWeight: 500 }}>Free access for all early users · No card required · Setup in minutes</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
            Run your business.<br />
            <span style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get paid faster.</span><br />
            Stay organised.
          </h1>
          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.6)', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.75 }}>
            Amana helps you manage customers, schedule appointments, send professional invoices, track payments, and automate follow-ups. All in one place.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/sign-up" style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '14px 30px', borderRadius: 12, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
              Create Free Account
            </Link>
            <a href="#demo" style={{ background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '14px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
              Watch Demo →
            </a>
          </div>

        </div>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section id="demo" style={{ background: '#ffffff', padding: '72px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>Watch Amana in action</h2>
            <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>
              See the complete workflow — sign in, add customers, book appointments, create invoices, and receive payments.
            </p>
          </div>
          <AmanaDemo />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: 'white', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>
              Run Your Business With Confidence
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Amana helps you stay organized, get paid on time, and manage your daily operations with ease.
            </p>
          </div>

          {/* Outcome groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
            {FEATURE_GROUPS.map(group => (
              <div key={group.group}>
                {/* Group label */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{group.icon}</span>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{group.group}</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 540, lineHeight: 1.7 }}>{group.desc}</p>
                </div>

                {/* Cards — same style as before */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
                  {group.cards.map(card => (
                    <div key={card.title} style={{ background: 'white', borderRadius: 14, padding: '24px 20px', border: '1px solid #F0EFFE', boxShadow: '0 2px 16px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{card.title}</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {card.points.map(point => (
                          <li key={point} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M20 6L9 17l-5-5" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Access Anywhere card — sits in the last group */}
                  {group.group === 'Understand Your Business' && (
                    <div style={{ background: 'white', borderRadius: 14, padding: '24px 20px', border: '1px solid #F0EFFE', boxShadow: '0 2px 16px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>🌍</div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Access Your Business Anywhere</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {['Manage customers on the go', 'Access invoices from any device', 'Keep your business organised anywhere'].map(point => (
                          <li key={point} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M20 6L9 17l-5-5" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '80px 20px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52, alignItems: 'center' }} className="cta-grid">
          {/* Left — headline and benefits */}
          <div className="cta-text">
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.15 }}>
              Create your free<br />account today
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 28, lineHeight: 1.75 }}>
              Join thousands of business owners who get paid faster with Amana. No credit card required.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Send professional invoices in seconds', 'Get paid online via card, USSD or transfer', 'Manage customers and appointments', 'Automated reminders — no manual follow-up', 'Free access for all early users'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>{b}</span>
                </div>
              ))}
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
      <section id="faq" style={{ background: '#F9FAFB', padding: '80px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: '#111827' }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: 22, color: '#7C3AED', flexShrink: 0, transition: 'transform 0.2s', display: 'inline-block', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#6B7280', lineHeight: 1.7, borderTop: '1px solid #F3F4F6' }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: 'white', padding: '80px 20px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#111827', marginBottom: 8 }}>Get in touch</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 6 }}>We respond within 24 hours.</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#7C3AED', marginBottom: 28 }}>support@amana.app</p>
          <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '26px', border: '1px solid #F3F4F6', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name</label>
                <input placeholder="Your name" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
                <input type="email" placeholder="you@example.com" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <textarea placeholder="How can we help?" rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit', marginBottom: 12 }} />
            <button style={{ width: '100%', height: 44, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Send Message</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0c0720', color: 'white', padding: '72px 20px 40px', borderTop: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* 4 columns on desktop, stacked on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40, marginBottom: 48 }} className="footer-grid">

            {/* Col 1 — Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, background: '#7C3AED', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 24 }}>Amana</span>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 22 }}>
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

            {/* Col 2 — Support */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.5)' }}>Support</p>
              {[
                { icon: '✉', l: 'Email', v: 'support@amana.app' },
                { icon: '🕐', l: 'Support Hours', v: '9am – 6pm WAT' },
                { icon: '📍', l: 'Location', v: 'Lagos, Nigeria' },
              ].map(c => (
                <div key={c.l} style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{c.l}</p>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{c.v}</p>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 4 }}>
                {[['Help Center','#'],['Business Support','#']].map(([l,h]) => (
                  <p key={l} style={{ marginBottom: 12 }}>
                    <Link href={h} style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>{l}</Link>
                  </p>
                ))}
              </div>
            </div>

            {/* Col 3 — Company */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.5)' }}>Company</p>
              {[['Home','/'],['About','#'],['Terms & Conditions','/terms'],['Privacy Policy','/privacy'],['Contact','#contact']].map(([l,h]) => (
                <p key={l} style={{ marginBottom: 14 }}>
                  <Link href={h} style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>{l}</Link>
                </p>
              ))}
            </div>

            {/* Col 4 — Product */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.5)' }}>Product</p>
              {[['Invoices','/dashboard/invoices'],['Payments','/dashboard/payments'],['Customers','/dashboard/customers'],['Appointments','/dashboard/appointments'],['Reports','/dashboard/reports']].map(([l,h]) => (
                <p key={l} style={{ marginBottom: 14 }}>
                  <Link href={h} style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>{l}</Link>
                </p>
              ))}
            </div>
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

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-header-right { display: flex !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          .cta-text { text-align: center !important; }
          .cta-text a { display: inline-block !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}