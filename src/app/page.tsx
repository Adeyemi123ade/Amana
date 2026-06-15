'use client'

import { useState } from 'react'
import Link from 'next/link'

const FEATURES = [
  { icon: '📄', title: 'Create Invoices in Seconds', desc: 'Generate professional invoices instantly. Add your business logo, customer details, and line items. Send directly to customers via email or WhatsApp.' },
  { icon: '💰', title: 'Track Payments Automatically', desc: 'Know exactly who has paid, who owes you, and what is overdue. Get real-time payment status updates the moment a customer pays.' },
  { icon: '👥', title: 'Manage Your Customers', desc: 'Keep a complete record of every customer — their contact details, payment history, appointments, and notes all in one place.' },
  { icon: '📅', title: 'Manage Bookings and Appointments', desc: 'Share your public booking page and let customers schedule appointments directly. Your calendar stays organised automatically.' },
  { icon: '🔔', title: 'Automated Reminders', desc: 'Never chase a customer manually again. Amana sends automatic payment reminders, appointment confirmations, and follow-up messages.' },
  { icon: '📊', title: 'Business Reports and Analytics', desc: 'Understand your revenue, top services, and growth trends. Get a clear picture of your business performance every week.' },
  { icon: '🤖', title: 'AI-Powered Business Tools', desc: 'Use AI to simplify your invoicing, generate professional document content, and get smart recommendations to grow your business.' },
  { icon: '🌍', title: 'Works in Every Country', desc: 'Amana supports businesses from Nigeria to the UK to the US and beyond. Multi-currency, international phone validation, and global reach.' },
]

const FOR_WHO = [
  'Freelancers and consultants','Photographers and creatives',
  'Hair stylists and beauty professionals','Coaches and trainers',
  'Event planners','Real estate agents','Healthcare practitioners',
  'Small retail businesses','Caterers and food vendors',
  'Legal and accounting professionals',
]

const FAQS = [
  { q: 'What does Amana do?', a: 'Amana is a complete business operations platform. It helps you create invoices, track payments, manage customers, schedule appointments, send automated reminders, and generate reports — all from one clean dashboard.' },
  { q: 'Who can use Amana?', a: 'Any small business owner, freelancer, or self-employed professional can use Amana. It works for photographers, consultants, coaches, beauty professionals, event planners, and many more.' },
  { q: 'Is Amana free?', a: 'Yes. Amana is currently completely free for all early users. You can create an account and use all features at no cost during the early access period.' },
  { q: 'Will it become paid later?', a: 'We may introduce paid plans in the future. However, early users will always have access to a generous free tier.' },
  { q: 'Can I create and send invoices?', a: 'Yes. You can create professional invoices in seconds, add line items, set due dates, and send them directly to your customers. Customers can pay instantly through Paystack.' },
  { q: 'Can I track who has paid and who has not?', a: 'Yes. Every invoice has a live payment status — Paid, Unpaid, or Overdue. You see it all in real time on your dashboard.' },
  { q: 'Can I manage my customers?', a: 'Yes. You have a full customer directory with contact information, invoice history, appointment records, and notes for every customer.' },
  { q: 'Can I manage appointments?', a: 'Yes. You get a calendar view of all appointments, a public booking page your customers can use to book themselves, and automated reminders to reduce no-shows.' },
  { q: 'Can I send payment reminders automatically?', a: 'Yes. Set up automatic reminders and Amana will send them on schedule — before due dates, on due dates, and after overdue — without you having to do anything manually.' },
  { q: 'Can I use Amana on my phone?', a: 'Yes. Amana is fully responsive and works on all mobile devices. Your dashboard, invoices, and customers are all accessible from your smartphone.' },
  { q: 'Is my data secure?', a: 'Yes. All data is stored securely using Supabase with row-level security, encrypted storage, and HTTPS throughout. Your business data belongs to you.' },
  { q: 'Can I use Amana outside Nigeria?', a: 'Yes. Amana supports users from all countries with multiple currencies and international phone numbers.' },
  { q: 'How do I contact support?', a: 'You can reach our support team using the contact form below, or email us at support@amana.app. We respond within 24 hours.' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#111827'}}>

      {/* ── HEADER ── */}
      <header style={{position:'sticky',top:0,zIndex:50,background:'rgba(26,15,60,0.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 20px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>

          {/* Logo */}
          <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
            <div style={{width:34,height:34,background:'#7C3AED',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{color:'white',fontWeight:800,fontSize:18,letterSpacing:-0.5}}>Amana</span>
          </Link>

          {/* Desktop nav */}
          <nav style={{display:'none'}} className="desktop-nav">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} style={{color:'rgba(255,255,255,0.7)',fontSize:14,textDecoration:'none',padding:'6px 14px'}}>
                {l.label}
              </a>
            ))}
            <Link href="/sign-in" style={{color:'rgba(255,255,255,0.7)',fontSize:14,textDecoration:'none',padding:'6px 14px'}}>Sign in</Link>
            <Link href="/sign-up" style={{background:'#7C3AED',color:'white',fontSize:14,fontWeight:600,textDecoration:'none',padding:'8px 18px',borderRadius:8,marginLeft:4}}>
              Get Started Free
            </Link>
          </nav>

          {/* Mobile: Get Started + hamburger */}
          <div style={{display:'flex',alignItems:'center',gap:10}} className="mobile-header-right">
            <Link href="/sign-up" style={{background:'#7C3AED',color:'white',fontSize:13,fontWeight:600,textDecoration:'none',padding:'8px 14px',borderRadius:8}} className="mobile-cta">
              Get Started Free
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{background:'none',border:'none',cursor:'pointer',padding:6,display:'flex',flexDirection:'column',gap:4,flexShrink:0}}
              className="hamburger"
              aria-label="Menu">
              <span style={{width:22,height:2,background:'white',borderRadius:2,display:'block',transition:'all 0.2s',transform:menuOpen?'rotate(45deg) translate(4px,4px)':'none'}}/>
              <span style={{width:22,height:2,background:'white',borderRadius:2,display:'block',transition:'all 0.2s',opacity:menuOpen?0:1}}/>
              <span style={{width:22,height:2,background:'white',borderRadius:2,display:'block',transition:'all 0.2s',transform:menuOpen?'rotate(-45deg) translate(4px,-4px)':'none'}}/>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{background:'rgba(26,15,60,0.99)',borderTop:'1px solid rgba(255,255,255,0.1)',padding:'8px 0 16px'}} className="mobile-menu">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                style={{display:'block',color:'rgba(255,255,255,0.85)',fontSize:15,textDecoration:'none',padding:'12px 24px',fontWeight:500}}>
                {l.label}
              </a>
            ))}
            <div style={{height:1,background:'rgba(255,255,255,0.1)',margin:'8px 24px'}}/>
            <Link href="/sign-in" onClick={() => setMenuOpen(false)}
              style={{display:'block',color:'rgba(255,255,255,0.7)',fontSize:15,textDecoration:'none',padding:'12px 24px'}}>
              Sign in
            </Link>
            <div style={{padding:'8px 24px 0'}}>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)}
                style={{display:'block',background:'#7C3AED',color:'white',fontSize:15,fontWeight:600,textDecoration:'none',padding:'13px 20px',borderRadius:10,textAlign:'center'}}>
                Create Free Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{background:'linear-gradient(160deg,#1a0f3c 0%,#2d1b69 60%,#1a0f3c 100%)',padding:'64px 20px 80px'}}>
        <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(124,58,237,0.2)',border:'1px solid rgba(124,58,237,0.4)',borderRadius:24,padding:'6px 14px',marginBottom:24}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#A78BFA',display:'inline-block',flexShrink:0}}/>
            <span style={{color:'#A78BFA',fontSize:13,fontWeight:500}}>Free for all early users — No credit card required</span>
          </div>
          <h1 style={{fontSize:'clamp(32px,5vw,64px)',fontWeight:900,color:'white',lineHeight:1.1,marginBottom:20,letterSpacing:-1}}>
            Run your business.<br/>
            <span style={{color:'#A78BFA'}}>Get paid faster.</span><br/>
            Stay organised.
          </h1>
          <p style={{fontSize:'clamp(15px,2vw,18px)',color:'rgba(255,255,255,0.65)',maxWidth:580,margin:'0 auto 36px',lineHeight:1.7}}>
            Amana is the all-in-one platform for small businesses to manage invoices, track payments, organise customers, schedule appointments, and automate reminders.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/sign-up" style={{background:'#7C3AED',color:'white',fontSize:15,fontWeight:700,textDecoration:'none',padding:'13px 28px',borderRadius:12,display:'inline-block'}}>
              Create Free Account
            </Link>
            <a href="#demo" style={{background:'rgba(255,255,255,0.08)',color:'white',fontSize:15,fontWeight:600,textDecoration:'none',padding:'13px 28px',borderRadius:12,border:'1px solid rgba(255,255,255,0.2)',display:'inline-block'}}>
              ▶ Watch Demo
            </a>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:36}}>
            <div style={{display:'flex'}}>
              {['#7C3AED','#6D28D9','#5B21B6','#4C1D95','#3B0764'].map((c,i) => (
                <div key={i} style={{width:28,height:28,borderRadius:'50%',background:c,border:'2px solid #1a0f3c',marginLeft:i>0?-6:0}}/>
              ))}
            </div>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:13}}>Trusted by <strong style={{color:'white'}}>12,000+</strong> businesses worldwide</p>
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section style={{background:'#F9FAFB',padding:'56px 20px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:'clamp(22px,3vw,34px)',fontWeight:800,color:'#111827',marginBottom:32}}>Built for every small business owner</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {FOR_WHO.map(item => (
              <div key={item} style={{background:'white',borderRadius:10,padding:'12px 14px',border:'1px solid #E5E7EB',fontSize:13,fontWeight:500,color:'#374151',display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:'#7C3AED',flexShrink:0}}>✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{background:'white',padding:'72px 20px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <h2 style={{fontSize:'clamp(22px,3vw,38px)',fontWeight:800,color:'#111827',marginBottom:14}}>Everything your business needs</h2>
            <p style={{fontSize:16,color:'#6B7280',maxWidth:520,margin:'0 auto'}}>Amana gives you the tools to run operations smoothly, get paid on time, and grow with confidence.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:20}}>
            {FEATURES.map(f => (
              <div key={f.title} style={{background:'#F9FAFB',borderRadius:14,padding:'24px 20px',border:'1px solid #F3F4F6'}}>
                <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
                <h3 style={{fontSize:15,fontWeight:700,color:'#111827',marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:13,color:'#6B7280',lineHeight:1.65}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{background:'#F5F3FF',padding:'72px 20px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <h2 style={{fontSize:'clamp(22px,3vw,36px)',fontWeight:800,color:'#111827',marginBottom:12}}>Stop losing money. Start getting paid.</h2>
            <p style={{fontSize:15,color:'#6B7280',maxWidth:520,margin:'0 auto'}}>Small businesses lose millions every year to unpaid invoices and disorganised records. Amana fixes all of that.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
            {[
              {num:'01',title:'Create invoices in 30 seconds',body:'Fill in the customer name, add items, set a due date, and hit send. Amana generates a professional invoice instantly.'},
              {num:'02',title:'Customers pay online instantly',body:'Every invoice comes with a payment link. Your customers can pay by card, bank transfer, or USSD — no manual collection.'},
              {num:'03',title:'Know your money in real time',body:'Your dashboard shows total revenue, unpaid invoices, and overdue accounts the moment you log in.'},
              {num:'04',title:'Never miss an appointment',body:'Customers book themselves using your public booking page. Amana sends automatic reminders so no-shows stop.'},
              {num:'05',title:'Follow up automatically',body:'Set up reminder rules and Amana handles the follow-ups — payment reminders, appointment confirmations, all automatic.'},
              {num:'06',title:'Understand your business growth',body:'Monthly reports show your revenue trends, top-earning services, and booking analytics so you make smarter decisions.'},
            ].map(s => (
              <div key={s.num} style={{background:'white',borderRadius:14,padding:'24px 20px',border:'1px solid #E9D5FF'}}>
                <p style={{fontSize:12,fontWeight:800,color:'#7C3AED',marginBottom:8,letterSpacing:0.5}}>{s.num}</p>
                <h3 style={{fontSize:15,fontWeight:700,color:'#111827',marginBottom:8}}>{s.title}</h3>
                <p style={{fontSize:13,color:'#6B7280',lineHeight:1.65}}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ── */}
      <section id="demo" style={{background:'white',padding:'72px 20px'}}>
        <div style={{maxWidth:860,margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:'clamp(22px,3vw,36px)',fontWeight:800,color:'#111827',marginBottom:14}}>Watch how it works</h2>
          <p style={{fontSize:15,color:'#6B7280',marginBottom:32}}>See how Amana helps you create invoices, manage customers, and get paid — in under 3 minutes.</p>
          <div style={{background:'#1a0f3c',borderRadius:16,overflow:'hidden',aspectRatio:'16/9',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:'2px solid #7C3AED',cursor:'pointer'}}>
            <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(124,58,237,0.8)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
            </div>
            <p style={{color:'rgba(255,255,255,0.8)',fontSize:15,fontWeight:600}}>Demo video coming soon</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{background:'linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%)',padding:'72px 20px',textAlign:'center'}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <h2 style={{fontSize:'clamp(22px,3vw,36px)',fontWeight:800,color:'white',marginBottom:14}}>Currently free for all early users</h2>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.8)',marginBottom:32,lineHeight:1.7}}>
            Create your account today and use all features at no cost. No credit card required.
          </p>
          <Link href="/sign-up" style={{background:'white',color:'#7C3AED',fontSize:15,fontWeight:700,textDecoration:'none',padding:'13px 32px',borderRadius:12,display:'inline-block'}}>
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{background:'#F9FAFB',padding:'72px 20px'}}>
        <div style={{maxWidth:760,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <h2 style={{fontSize:'clamp(22px,3vw,36px)',fontWeight:800,color:'#111827'}}>Frequently asked questions</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {FAQS.map((faq, i) => (
              <details key={i} style={{background:'white',borderRadius:12,border:'1px solid #E5E7EB',overflow:'hidden'}}>
                <summary style={{padding:'16px 18px',fontSize:14,fontWeight:600,color:'#111827',cursor:'pointer',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                  {faq.q}
                  <span style={{fontSize:18,color:'#7C3AED',flexShrink:0}}>+</span>
                </summary>
                <div style={{padding:'0 18px 16px',fontSize:13,color:'#6B7280',lineHeight:1.7,borderTop:'1px solid #F3F4F6'}}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{background:'white',padding:'72px 20px'}}>
        <div style={{maxWidth:600,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <h2 style={{fontSize:'clamp(22px,3vw,34px)',fontWeight:800,color:'#111827',marginBottom:10}}>Get in touch</h2>
            <p style={{fontSize:15,color:'#6B7280'}}>Have a question? We respond within 24 hours.</p>
            <p style={{fontSize:14,color:'#7C3AED',marginTop:6,fontWeight:500}}>support@amana.app</p>
          </div>
          <div style={{background:'#F9FAFB',borderRadius:14,padding:'28px 24px',border:'1px solid #F3F4F6'}}>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6}}>Your name</label>
                  <input placeholder="John Doe" style={{width:'100%',height:42,padding:'0 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:13,outline:'none',boxSizing:'border-box',background:'white'}} />
                </div>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6}}>Email address</label>
                  <input type="email" placeholder="john@example.com" style={{width:'100%',height:42,padding:'0 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:13,outline:'none',boxSizing:'border-box',background:'white'}} />
                </div>
              </div>
              <div>
                <label style={{display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6}}>Message</label>
                <textarea placeholder="How can we help you?" rows={4} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical',background:'white',fontFamily:'inherit'}} />
              </div>
              <button style={{height:46,background:'#7C3AED',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:'#111827',color:'white',padding:'48px 20px 32px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          {/* Logo + description */}
          <div style={{marginBottom:32,textAlign:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center',marginBottom:10}}>
              <div style={{width:28,height:28,background:'#7C3AED',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
              </div>
              <span style={{fontWeight:800,fontSize:16}}>Amana</span>
            </div>
            <p style={{fontSize:13,color:'#9CA3AF',maxWidth:320,margin:'0 auto'}}>The all-in-one business operations platform for small businesses worldwide.</p>
          </div>

          {/* Footer links — 3 columns side by side */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,marginBottom:32,maxWidth:560,margin:'0 auto 32px'}}>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:'white',marginBottom:10,textTransform:'uppercase',letterSpacing:0.8}}>Product</p>
              {[['Features','#features'],['Demo','#demo'],['FAQ','#faq']].map(([l,h]) => (
                <p key={l} style={{marginBottom:6}}>
                  <a href={h} style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>{l}</a>
                </p>
              ))}
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:'white',marginBottom:10,textTransform:'uppercase',letterSpacing:0.8}}>Account</p>
              {[['Sign Up','/sign-up'],['Sign In','/sign-in']].map(([l,h]) => (
                <p key={l} style={{marginBottom:6}}>
                  <Link href={h} style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>{l}</Link>
                </p>
              ))}
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:'white',marginBottom:10,textTransform:'uppercase',letterSpacing:0.8}}>Legal</p>
              {[['Terms','/terms'],['Privacy','/privacy']].map(([l,h]) => (
                <p key={l} style={{marginBottom:6}}>
                  <Link href={h} style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>{l}</Link>
                </p>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{borderTop:'1px solid #374151',paddingTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
            <p style={{fontSize:12,color:'#6B7280'}}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
            <div style={{display:'flex',gap:16}}>
              <Link href="/terms" style={{fontSize:12,color:'#6B7280',textDecoration:'none'}}>Terms</Link>
              <Link href="/privacy" style={{fontSize:12,color:'#6B7280',textDecoration:'none'}}>Privacy</Link>
              <a href="#contact" style={{fontSize:12,color:'#6B7280',textDecoration:'none'}}>Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        /* Desktop nav visible, hamburger hidden */
        .desktop-nav { display: flex !important; align-items: center; gap: 4px; }
        .mobile-header-right { display: none !important; }
        .mobile-menu { display: none; }

        /* Mobile — hamburger shown, desktop nav hidden */
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-header-right { display: flex !important; }
          .mobile-menu { display: block; }
        }
      `}</style>
    </div>
  )
}
