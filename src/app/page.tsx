'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const FEATURES = [
  { icon: '📄', title: 'Create Invoices in Seconds', desc: 'Generate professional invoices instantly. Send directly to customers via email with a payment link.' },
  { icon: '💰', title: 'Track Payments Automatically', desc: 'Know exactly who has paid, who owes you, and what is overdue — in real time.' },
  { icon: '👥', title: 'Manage Your Customers', desc: 'Complete customer records — contact details, payment history, appointments, notes all in one place.' },
  { icon: '📅', title: 'Appointments & Bookings', desc: 'Share your public booking page. Customers schedule themselves. Calendar stays organised automatically.' },
  { icon: '🔔', title: 'Automated Reminders', desc: 'Amana sends payment reminders, appointment confirmations, and follow-up messages automatically.' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Understand your revenue, top services, and growth trends every week.' },
  { icon: '🤖', title: 'AI-Powered Tools', desc: 'Smart recommendations to write invoices, follow up with customers, and grow your business.' },
  { icon: '🌍', title: 'Works Everywhere', desc: 'Multi-currency support. Works in Nigeria, UAE, UK, US and across Africa and beyond.' },
]

const FAQS = [
  { q: 'What does Amana do?', a: 'Amana is a complete business operations platform. Create invoices, track payments, manage customers, schedule appointments, send automated reminders, and generate reports — all from one dashboard.' },
  { q: 'Who can use Amana?', a: 'Any small business owner, freelancer, or self-employed professional. Photographers, consultants, coaches, beauty professionals, event planners, caterers, and many more.' },
  { q: 'Is Amana free?', a: 'Yes. Amana is completely free for all early users. All features at no cost during the early access period.' },
  { q: 'Can I create and send invoices?', a: 'Yes. Create professional invoices in seconds, add line items, set due dates, and send them directly to customers by email. Customers can pay instantly through Paystack.' },
  { q: 'Can I track who has paid and who has not?', a: 'Yes. Every invoice has a live payment status — Paid, Unpaid, or Overdue. You see it all in real time on your dashboard.' },
  { q: 'Can I manage my customers?', a: 'Yes. Full customer directory with contact info, invoice history, appointment records, and notes for every customer.' },
  { q: 'Can I manage appointments?', a: 'Yes. Calendar view, public booking page, and automated reminders to reduce no-shows.' },
  { q: 'Can I use Amana on my phone?', a: 'Yes. Amana is fully responsive and works on all mobile devices.' },
  { q: 'Is my data secure?', a: 'Yes. All data is stored securely with row-level security, encrypted storage, and HTTPS throughout.' },
  { q: 'Can I use Amana outside Nigeria?', a: 'Yes. Multi-currency support for users from Nigeria, UAE, UK, US, Ghana, Kenya, South Africa and beyond.' },
]

// Floating card data for hero animation
const FLOATING_CARDS = [
  { top: '8%',  left: '2%',  label: 'Invoice Paid', value: '₦125,000', icon: '✅', color: '#22C55E', delay: '0s' },
  { top: '18%', right: '2%', label: 'New Booking',  value: 'Hair Session · 2pm', icon: '📅', color: '#7C3AED', delay: '0.4s' },
  { top: '52%', left: '2%',  label: 'Payment Alert', value: '3 Invoices Overdue', icon: '🔴', color: '#EF4444', delay: '0.8s' },
  { top: '62%', right: '2%', label: 'Revenue Today', value: '₦340,000', icon: '📈', color: '#F59E0B', delay: '1.2s' },
  { top: '82%', left: '6%',  label: 'Customer Added', value: 'Tunde Oladipo', icon: '👤', color: '#3B82F6', delay: '1.6s' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const interval = setInterval(() => {
      setCount(c => (c + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ]

  const HERO_STATS = [
    { label: 'Businesses', value: '12,000+' },
    { label: 'Invoices Sent', value: '840K+' },
    { label: 'Avg Time Saved', value: '6 hrs/wk' },
  ]

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: '#111827', overflowX: 'hidden' }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,8,40,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#7C3AED', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white" /></svg>
            </div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Amana</span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, textDecoration: 'none', padding: '6px 14px', borderRadius: 6, transition: 'color 0.2s' }}>{l.label}</a>
            ))}
            <Link href="/sign-in" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, textDecoration: 'none', padding: '6px 14px' }}>Sign in</Link>
            <Link href="/sign-up" style={{ background: '#7C3AED', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '8px 18px', borderRadius: 8, marginLeft: 4 }}>
              Get Started Free
            </Link>
          </nav>

          {/* Mobile */}
          <div style={{ display: 'none', alignItems: 'center', gap: 10 }} className="mobile-header-right">
            <Link href="/sign-up" style={{ background: '#7C3AED', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>
              Get Started Free
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ width: 22, height: 2, background: 'white', borderRadius: 2, display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px,4px)' : 'none' }} />
              <span style={{ width: 22, height: 2, background: 'white', borderRadius: 2, display: 'block', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ width: 22, height: 2, background: 'white', borderRadius: 2, display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none' }} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: 'rgba(15,8,40,0.99)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: 15, textDecoration: 'none', padding: '12px 24px', fontWeight: 500 }}>{l.label}</a>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 24px' }} />
            <Link href="/sign-in" onClick={() => setMenuOpen(false)} style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 15, textDecoration: 'none', padding: '12px 24px' }}>Sign in</Link>
            <div style={{ padding: '8px 24px 0' }}>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', background: '#7C3AED', color: 'white', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '13px 20px', borderRadius: 10, textAlign: 'center' }}>
                Create Free Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(160deg,#0f0828 0%,#1a0f3c 40%,#2d1b69 70%,#1a0f3c 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 20px', position: 'relative', overflow: 'hidden' }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)', borderRadius: '50%', animation: 'float1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(167,139,250,0.1) 0%,transparent 70%)', borderRadius: '50%', animation: 'float2 10s ease-in-out infinite' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1, width: '100%' }} className="hero-grid">
          {/* Left — text */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 24, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#A78BFA', fontSize: 13, fontWeight: 500 }}>Free for all early users · No credit card</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px,4.5vw,60px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
              Run your business.<br />
              <span style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get paid faster.</span><br />
              Stay organised.
            </h1>
            <p style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'rgba(255,255,255,0.65)', maxWidth: 480, lineHeight: 1.75, marginBottom: 36 }}>
              Amana is the all-in-one platform for small businesses to manage invoices, track payments, organise customers, schedule appointments, and automate reminders — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href="/sign-up" style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '14px 28px', borderRadius: 12, display: 'inline-block', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                Create Free Account
              </Link>
              <a href="#features" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>
                See Features →
              </a>
            </div>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {HERO_STATS.map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 900, color: 'white', marginBottom: 2 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated dashboard preview */}
          <div style={{ position: 'relative', height: 520 }} className="hero-visual">
            {/* Main dashboard card */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '85%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '20px', backdropFilter: 'blur(20px)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
              {/* Fake topbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white" /></svg>
                </div>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Amana Dashboard</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  {['#EF4444','#F59E0B','#22C55E'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
                </div>
              </div>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Revenue', val: '₦1.2M', color: '#22C55E' },
                  { label: 'Invoices', val: '47', color: '#7C3AED' },
                  { label: 'Customers', val: '128', color: '#F59E0B' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 10px' }}>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>{s.label}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>
              {/* Fake chart bars */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', marginBottom: 10 }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase' }}>Revenue — last 6 months</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 50 }}>
                  {[40, 65, 45, 80, 55, 90].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: h + '%', background: i === 5 ? '#7C3AED' : 'rgba(124,58,237,0.3)', borderRadius: '3px 3px 0 0', transition: 'height 1s ease', minHeight: 4 }} />
                  ))}
                </div>
              </div>
              {/* Fake invoice rows */}
              {[
                { name: 'Tunde Oladipo', amt: '₦45,000', status: 'Paid', color: '#22C55E', bg: '#064E3B' },
                { name: 'Amaka Chisom', amt: '₦28,000', status: 'Unpaid', color: '#F59E0B', bg: '#78350F' },
              ].map(r => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>{r.name[0]}</div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{r.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{r.amt}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: r.color, background: r.bg + '66', padding: '2px 6px', borderRadius: 10 }}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating notification cards */}
            {FLOATING_CARDS.map((card, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: card.top,
                left: (card as any).left,
                right: (card as any).right,
                background: 'rgba(15,8,40,0.9)',
                border: `1px solid ${card.color}44`,
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${card.color}22`,
                animation: `floatCard 4s ease-in-out infinite`,
                animationDelay: card.delay,
                minWidth: 160,
                zIndex: 10,
              }}>
                <span style={{ fontSize: 16 }}>{card.icon}</span>
                <div>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>{card.label}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: card.color }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section style={{ background: '#F9FAFB', padding: '60px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(20px,3vw,34px)', fontWeight: 800, color: '#111827', marginBottom: 32 }}>Built for every small business owner</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {['Freelancers','Photographers','Hair Stylists','Coaches & Trainers','Event Planners','Real Estate Agents','Healthcare Providers','Caterers & Food Vendors','Accountants & Lawyers','Retail Businesses','Consultants','Digital Marketers','Tailors & Fashion Designers','Electricians & Contractors'].map(item => (
              <span key={item} style={{ background: 'white', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#374151', border: '1px solid #E5E7EB' }}>
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: 'white', padding: '72px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,38px)', fontWeight: 800, color: '#111827', marginBottom: 14 }}>Everything your business needs</h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 520, margin: '0 auto' }}>Amana gives you tools to run operations smoothly, get paid on time, and grow with confidence.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#F9FAFB', borderRadius: 14, padding: '24px 20px', border: '1px solid #F3F4F6', transition: 'transform 0.2s,box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(124,58,237,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%)', padding: '72px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>Start managing your business today</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32, lineHeight: 1.7 }}>
            Currently free for all early users. No credit card required.
          </p>
          <Link href="/sign-up" style={{ background: 'white', color: '#7C3AED', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '14px 32px', borderRadius: 12, display: 'inline-block' }}>
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: '#F9FAFB', padding: '72px 20px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 800, color: '#111827' }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: 20, color: '#7C3AED', flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 18px 16px', fontSize: 13, color: '#6B7280', lineHeight: 1.7, borderTop: '1px solid #F3F4F6' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: 'white', padding: '72px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#111827', marginBottom: 10 }}>Get in touch</h2>
            <p style={{ fontSize: 15, color: '#6B7280' }}>We respond within 24 hours.</p>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '28px 24px', border: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name</label>
                  <input placeholder="Your name" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
                  <input type="email" placeholder="you@example.com" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Message</label>
                <textarea placeholder="How can we help?" rows={4} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', background: 'white', fontFamily: 'inherit' }} />
              </div>
              <button style={{ height: 46, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f0828', color: 'white', padding: '64px 20px 32px', borderTop: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Main footer grid — 4 columns like the image */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40, marginBottom: 48 }}>

            {/* Col 1 — Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: '#7C3AED', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white" /></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>Amana</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20, maxWidth: 220 }}>
                The all-in-one business operations platform for small businesses worldwide.
              </p>
              {/* Social icons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { href: '#', icon: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.031-.196-8.012-2.227-10.512-5.307-1.33 2.315-.664 5.348 1.638 6.883-1.017-.014-1.977-.312-2.816-.775 0 .028 0 .054 0 .082 0 2.7 1.902 4.958 4.428 5.469-.464.126-.943.195-1.454.195-.356 0-.702-.034-1.04-.1.702 2.192 2.74 3.788 5.153 3.834-1.89 1.48-4.273 2.364-6.87 2.364-.447 0-.887-.026-1.322-.077 2.45 1.578 5.362 2.498 8.486 2.498 10.194 0 15.775-8.453 15.775-15.785 0-.241-.007-.48-.019-.716 1.083-.78 2.023-1.756 2.765-2.867z', label: 'Twitter', color: '#1DA1F2' },
                  { href: '#', icon: 'M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z', label: 'Twitter', color: '#1DA1F2' },
                  { href: '#', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', label: 'LinkedIn', color: '#0A66C2' },
                  { href: '#', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', label: 'Instagram', color: '#E4405F' },
                ].map(s => (
                  <a key={s.label} href={s.href} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={s.color}><path d={s.icon} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 — Contact */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Contact Us</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Email Support</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>support@amana.app</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.9 15.56a19.79 19.79 0 01-3.07-8.67A2 2 0 013.8 5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 12.64a16 16 0 006.27 6.27l.96-.96a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 20.18z" /></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>WhatsApp Support</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Available 9am–6pm WAT</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Headquarters</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 3 — Pages */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Pages</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Features', href: '#features' },
                  { label: 'FAQ', href: '#faq' },
                  { label: 'Contact', href: '#contact' },
                  { label: 'Terms & Conditions', href: '/terms' },
                  { label: 'Privacy Policy', href: '/privacy' },
                ].map(l => (
                  <Link key={l.label} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 4 — Account */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Account</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {[
                  { label: 'Sign Up — Free', href: '/sign-up' },
                  { label: 'Sign In', href: '/sign-in' },
                ].map(l => (
                  <Link key={l.label} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <Link href="/sign-up" style={{ display: 'block', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', textDecoration: 'none', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                Get Started Free →
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Terms</Link>
              <Link href="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Privacy</Link>
              <a href="#contact" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Contact</a>
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

        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
