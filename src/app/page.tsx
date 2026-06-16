'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const AmanaDemo = dynamic(() => import('@/components/AmanadDemo'), { ssr: false })

const FEATURES = [
  { icon: '📄', title: 'Invoices in Seconds', desc: 'Generate professional invoices instantly. Send directly to customers by email with a payment link.' },
  { icon: '💰', title: 'Real-Time Payment Tracking', desc: 'Know exactly who has paid, who owes, and what is overdue the moment it changes.' },
  { icon: '👥', title: 'Customer Management', desc: 'Full customer records — contact details, payment history, appointments, and notes.' },
  { icon: '📅', title: 'Appointments & Bookings', desc: 'Public booking page. Customers self-schedule. Automated reminders cut no-shows.' },
  { icon: '🔔', title: 'Automated Follow-Ups', desc: 'Payment reminders, appointment confirmations, and overdue alerts — all automatic.' },
  { icon: '📊', title: 'Business Reports', desc: 'Weekly revenue trends, top-earning services, and growth analytics at a glance.' },
  { icon: '💳', title: 'Paystack Payments', desc: 'Customers pay by card, USSD, or bank transfer. Invoice marks paid automatically.' },
  { icon: '🌍', title: 'Multi-Country Support', desc: 'Works in Nigeria, UAE, UK, US, Ghana, Kenya and across Africa. Multi-currency built in.' },
]

const FAQS = [
  { q: 'What does Amana do?', a: 'Amana is a complete business management platform. Create invoices, track payments, manage customers, schedule appointments, send reminders — all from one dashboard.' },
  { q: 'Is Amana free?', a: 'Yes. Amana is completely free for all early users. All features available at no cost during the early access period.' },
  { q: 'Who can use Amana?', a: 'Any small business owner or freelancer — photographers, coaches, hair stylists, event planners, consultants, caterers, and many more.' },
  { q: 'Can I track who has paid?', a: 'Yes. Every invoice shows live payment status — Paid, Unpaid, or Overdue — updated the moment a customer pays.' },
  { q: 'Does it work on mobile?', a: 'Yes. Amana is fully responsive and works on all smartphones and tablets.' },
  { q: 'Can I use it outside Nigeria?', a: 'Yes. Multi-currency support for Nigeria, UAE, UK, US, Ghana, Kenya, South Africa and more.' },
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
          <div style={{ display: 'none', alignItems: 'center', gap: 10 }} className="mobile-header-right">
            <Link href="/sign-up" style={{ background: '#7C3AED', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>Get Started</Link>
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
      <section style={{ background: 'linear-gradient(160deg,#0c0720 0%,#160d3a 50%,#0c0720 100%)', padding: '88px 20px 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 24, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#A78BFA', fontSize: 13, fontWeight: 500 }}>Free for all early users · No credit card needed</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
            Run your business.<br />
            <span style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get paid faster.</span><br />
            Stay organised.
          </h1>
          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.6)', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.75 }}>
            The all-in-one platform for small businesses to invoice customers, track payments, manage appointments, and automate reminders.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/sign-up" style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '14px 30px', borderRadius: 12, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
              Create Free Account
            </Link>
            <a href="#demo" style={{ background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '14px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
              Watch Demo →
            </a>
          </div>
          <div style={{ display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ n: '12,000+', l: 'Businesses' }, { n: '840K+', l: 'Invoices Sent' }, { n: '6 hrs', l: 'Saved Per Week' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: 'white', marginBottom: 2 }}>{s.n}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section id="demo" style={{ background: '#0c0720', padding: '72px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Live Demonstration</p>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: 'white', marginBottom: 12 }}>Watch Amana in action</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto' }}>
              See the complete workflow — sign in, add customers, create invoices, book appointments, and receive payments.
            </p>
          </div>
          <AmanaDemo />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: 'white', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>Everything your business needs</h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>One platform to run your operations, get paid on time, and grow.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#F9FAFB', borderRadius: 14, padding: '24px 20px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>Start for free today</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 32, lineHeight: 1.7 }}>Join thousands of business owners who get paid faster with Amana.</p>
          <Link href="/sign-up" style={{ background: 'white', color: '#7C3AED', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '14px 36px', borderRadius: 12, display: 'inline-block' }}>Create Free Account</Link>
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
      <footer style={{ background: '#0c0720', color: 'white', padding: '60px 20px 32px', borderTop: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: '#7C3AED', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 17 }}>Amana</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20, maxWidth: 220 }}>The all-in-one business platform for small businesses worldwide.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#1DA1F2','#0A66C2','#E4405F','#25D366'].map((c, i) => (
                  <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: c, opacity: 0.8 }} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Contact Us</p>
              {[{ icon: '✉', l: 'Email', v: 'support@amana.app' }, { icon: '📞', l: 'Support Hours', v: '9am – 6pm WAT' }, { icon: '📍', l: 'Location', v: 'Lagos, Nigeria' }].map(c => (
                <div key={c.l} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>{c.l}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{c.v}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Pages</p>
              {[['Home','/'],['Demo','#demo'],['Features','#features'],['FAQ','#faq'],['Terms','/terms'],['Privacy','/privacy']].map(([l,h]) => (
                <p key={l} style={{ marginBottom: 10 }}><Link href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{l}</Link></p>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Account</p>
              {[['Sign Up — Free','/sign-up'],['Sign In','/sign-in']].map(([l,h]) => (
                <p key={l} style={{ marginBottom: 10 }}><Link href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{l}</Link></p>
              ))}
              <Link href="/sign-up" style={{ display: 'block', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', textDecoration: 'none', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center', marginTop: 16 }}>Get Started Free →</Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 18 }}>
              {[['Terms','/terms'],['Privacy','/privacy'],['Contact','#contact']].map(([l,h]) => (
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
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}
