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
  'Freelancers and consultants',
  'Photographers and creatives',
  'Hair stylists and beauty professionals',
  'Coaches and trainers',
  'Event planners',
  'Real estate agents',
  'Healthcare practitioners',
  'Small retail businesses',
  'Caterers and food vendors',
  'Legal and accounting professionals',
]

const FAQS = [
  { q: 'What does Amana do?', a: 'Amana is a complete business operations platform. It helps you create invoices, track payments, manage customers, schedule appointments, send automated reminders, and generate reports — all from one clean dashboard.' },
  { q: 'Who can use Amana?', a: 'Any small business owner, freelancer, or self-employed professional can use Amana. It works for photographers, consultants, coaches, beauty professionals, event planners, and many more.' },
  { q: 'Is Amana free?', a: 'Yes. Amana is currently completely free for all early users. You can create an account and use all features at no cost during the early access period.' },
  { q: 'Will it become paid later?', a: 'We may introduce paid plans in the future to support continued development and add advanced features. However, early users will always have access to a generous free tier.' },
  { q: 'Can I create and send invoices?', a: 'Yes. You can create professional invoices in seconds, add line items, set due dates, and send them directly to your customers. Customers can pay instantly through Paystack.' },
  { q: 'Can I track who has paid and who has not?', a: 'Yes. Every invoice has a live payment status — Paid, Unpaid, or Overdue. You see it all in real time on your dashboard.' },
  { q: 'Can I manage my customers?', a: 'Yes. You have a full customer directory with contact information, invoice history, appointment records, and notes for every customer.' },
  { q: 'Can I manage appointments and bookings?', a: 'Yes. You get a calendar view of all appointments, a public booking page your customers can use to book themselves, and automated reminders to reduce no-shows.' },
  { q: 'Can I send payment reminders automatically?', a: 'Yes. Set up automatic reminders and Amana will send them on schedule — before due dates, on due dates, and after overdue — without you having to do anything manually.' },
  { q: 'Can I use Amana on my phone?', a: 'Yes. Amana is fully responsive and works on all mobile devices. Your dashboard, invoices, and customers are all accessible from your smartphone.' },
  { q: 'Can I use Amana on desktop?', a: 'Yes. Amana is designed as a full desktop web application with a permanent sidebar, wide layouts, and full feature access on desktop browsers.' },
  { q: 'Is my data secure?', a: 'Yes. All data is stored securely using Supabase — a PostgreSQL-based platform with row-level security, encrypted storage, and HTTPS throughout. Your business data belongs to you.' },
  { q: 'Can I upload my business logo and details?', a: 'Yes. In Settings, you can update your business name, address, email, phone, website, and logo. These details appear on your invoices automatically.' },
  { q: 'Can I upload or change my profile image?', a: 'Yes. Click your avatar in the top-right corner of the dashboard to upload, change, or remove your profile image.' },
  { q: 'Can I invite team members?', a: 'Yes. Under Settings → Team Members, you can invite colleagues by email and assign them roles to help manage your business account.' },
  { q: 'Can I download or export invoices?', a: 'Yes. You can download any invoice as a PDF directly from the invoice detail page.' },
  { q: 'Can my customers book appointments online?', a: 'Yes. Every Amana account gets a public booking page with your business branding. Share the link and customers can self-book available time slots.' },
  { q: 'Can I use Amana outside Nigeria?', a: 'Yes. Amana supports users from all countries. The app supports multiple currencies and international phone numbers.' },
  { q: 'What countries are supported?', a: 'All countries are supported. You can select your country during signup from a complete global list, and the phone code will be set automatically.' },
  { q: 'How do I contact support?', a: 'You can reach our support team using the contact form at the bottom of this page, or email us at support@amana.app. We respond within 24 hours.' },
]

export default function LandingPage() {
  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#111827'}}>

      {/* ── HEADER ── */}
      <header style={{position:'sticky',top:0,zIndex:50,background:'rgba(26,15,60,0.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,background:'#7C3AED',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{color:'white',fontWeight:800,fontSize:18,letterSpacing:-0.5}}>Amana</span>
          </div>
          <nav style={{display:'flex',alignItems:'center',gap:8}}>
            <a href="#features" style={{color:'rgba(255,255,255,0.7)',fontSize:14,textDecoration:'none',padding:'6px 12px'}}>Features</a>
            <a href="#faq" style={{color:'rgba(255,255,255,0.7)',fontSize:14,textDecoration:'none',padding:'6px 12px'}}>FAQ</a>
            <a href="#contact" style={{color:'rgba(255,255,255,0.7)',fontSize:14,textDecoration:'none',padding:'6px 12px'}}>Contact</a>
            <Link href="/sign-in" style={{color:'rgba(255,255,255,0.7)',fontSize:14,textDecoration:'none',padding:'6px 12px'}}>Sign in</Link>
            <Link href="/sign-up" style={{background:'#7C3AED',color:'white',fontSize:14,fontWeight:600,textDecoration:'none',padding:'8px 18px',borderRadius:8}}>Get Started Free</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{background:'linear-gradient(160deg,#1a0f3c 0%,#2d1b69 60%,#1a0f3c 100%)',padding:'80px 24px 100px'}}>
        <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(124,58,237,0.2)',border:'1px solid rgba(124,58,237,0.4)',borderRadius:24,padding:'6px 16px',marginBottom:28}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#A78BFA',display:'inline-block'}}/>
            <span style={{color:'#A78BFA',fontSize:13,fontWeight:500}}>Free for all early users — No credit card required</span>
          </div>
          <h1 style={{fontSize:'clamp(36px,5vw,64px)',fontWeight:900,color:'white',lineHeight:1.1,marginBottom:20,letterSpacing:-1.5}}>
            Run your business.<br/>
            <span style={{color:'#A78BFA'}}>Get paid faster.</span><br/>
            Stay organised.
          </h1>
          <p style={{fontSize:'clamp(16px,2vw,20px)',color:'rgba(255,255,255,0.65)',maxWidth:620,margin:'0 auto 40px',lineHeight:1.7}}>
            Amana is the all-in-one platform for small businesses to manage invoices, track payments, organise customers, schedule appointments, and automate reminders — powered by AI.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/sign-up" style={{background:'#7C3AED',color:'white',fontSize:16,fontWeight:700,textDecoration:'none',padding:'14px 32px',borderRadius:12,display:'inline-block'}}>
              Create Free Account
            </Link>
            <a href="#demo" style={{background:'rgba(255,255,255,0.08)',color:'white',fontSize:16,fontWeight:600,textDecoration:'none',padding:'14px 32px',borderRadius:12,border:'1px solid rgba(255,255,255,0.2)',display:'inline-block'}}>
              ▶ Watch Demo
            </a>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:40}}>
            <div style={{display:'flex'}}>
              {['#7C3AED','#6D28D9','#5B21B6','#4C1D95','#3B0764'].map((c,i) => (
                <div key={i} style={{width:30,height:30,borderRadius:'50%',background:c,border:'2px solid #1a0f3c',marginLeft:i>0?-6:0}}/>
              ))}
            </div>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:14}}>Trusted by <strong style={{color:'white'}}>12,000+</strong> businesses worldwide</p>
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section style={{background:'#F9FAFB',padding:'64px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
          <p style={{fontSize:13,fontWeight:700,color:'#7C3AED',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>Who it is for</p>
          <h2 style={{fontSize:'clamp(24px,3vw,36px)',fontWeight:800,color:'#111827',marginBottom:40}}>Built for every small business owner</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
            {FOR_WHO.map(item => (
              <div key={item} style={{background:'white',borderRadius:12,padding:'14px 16px',border:'1px solid #E5E7EB',fontSize:13,fontWeight:500,color:'#374151',display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:'#7C3AED'}}>✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{background:'white',padding:'80px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <p style={{fontSize:13,fontWeight:700,color:'#7C3AED',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>Features</p>
            <h2 style={{fontSize:'clamp(24px,3vw,40px)',fontWeight:800,color:'#111827',marginBottom:16}}>Everything your business needs</h2>
            <p style={{fontSize:17,color:'#6B7280',maxWidth:560,margin:'0 auto'}}>Amana gives you the tools to run operations smoothly, get paid on time, and grow with confidence.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:24}}>
            {FEATURES.map(f => (
              <div key={f.title} style={{background:'#F9FAFB',borderRadius:16,padding:'28px 24px',border:'1px solid #F3F4F6'}}>
                <div style={{fontSize:32,marginBottom:14}}>{f.icon}</div>
                <h3 style={{fontSize:16,fontWeight:700,color:'#111827',marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:14,color:'#6B7280',lineHeight:1.65}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT HELPS ── */}
      <section style={{background:'#F5F3FF',padding:'80px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <h2 style={{fontSize:'clamp(24px,3vw,38px)',fontWeight:800,color:'#111827',marginBottom:12}}>Stop losing money. Start getting paid.</h2>
            <p style={{fontSize:16,color:'#6B7280',maxWidth:560,margin:'0 auto'}}>Small businesses lose millions every year to unpaid invoices, missed appointments, and disorganised records. Amana fixes all of that.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24}}>
            {[
              {num:'01',title:'Create invoices in 30 seconds',body:'Fill in the customer name, add items, set a due date, and hit send. Amana generates a professional invoice instantly and delivers it to your customer.'},
              {num:'02',title:'Customers pay online instantly',body:'Every invoice comes with a payment link powered by Paystack. Your customers can pay by card, bank transfer, or USSD — no manual collection.'},
              {num:'03',title:'Know your money in real time',body:'Your dashboard shows total revenue, unpaid invoices, and overdue accounts the moment you log in. You always know exactly where your money is.'},
              {num:'04',title:'Never miss an appointment',body:'Your customers book themselves using your public booking page. Amana sends automatic reminders so no-shows become a thing of the past.'},
              {num:'05',title:'Follow up automatically',body:'Set up reminder rules and Amana handles the follow-ups — payment reminders, appointment confirmations, and customer check-ins — all automatic.'},
              {num:'06',title:'Understand your business growth',body:'Monthly reports show your revenue trends, top-earning services, customer retention, and booking analytics so you can make smarter business decisions.'},
            ].map(s => (
              <div key={s.num} style={{background:'white',borderRadius:16,padding:'28px 24px',border:'1px solid #E9D5FF'}}>
                <p style={{fontSize:13,fontWeight:800,color:'#7C3AED',marginBottom:10,letterSpacing:0.5}}>{s.num}</p>
                <h3 style={{fontSize:16,fontWeight:700,color:'#111827',marginBottom:8}}>{s.title}</h3>
                <p style={{fontSize:14,color:'#6B7280',lineHeight:1.65}}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ── */}
      <section id="demo" style={{background:'white',padding:'80px 24px'}}>
        <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <p style={{fontSize:13,fontWeight:700,color:'#7C3AED',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>Demo</p>
          <h2 style={{fontSize:'clamp(24px,3vw,38px)',fontWeight:800,color:'#111827',marginBottom:16}}>Watch how it works</h2>
          <p style={{fontSize:16,color:'#6B7280',marginBottom:40}}>See how Amana helps you create invoices, manage customers, and get paid — in under 3 minutes.</p>
          {/* Video placeholder — replace src with real video URL when ready */}
          <div style={{background:'#1a0f3c',borderRadius:20,overflow:'hidden',aspectRatio:'16/9',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:'2px solid #7C3AED',position:'relative',cursor:'pointer'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(124,58,237,0.8)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
            </div>
            <p style={{color:'rgba(255,255,255,0.8)',fontSize:16,fontWeight:600}}>Demo video coming soon</p>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:13,marginTop:6}}>Embed your YouTube, Vimeo, or local video here</p>
            {/* 
              TO EMBED REAL VIDEO — replace this div content with:
              YouTube: <iframe width="100%" height="100%" src="https://www.youtube.com/embed/YOUR_VIDEO_ID" frameBorder="0" allowFullScreen style={{position:'absolute',inset:0}} />
              Vimeo:   <iframe width="100%" height="100%" src="https://player.vimeo.com/video/YOUR_VIDEO_ID" frameBorder="0" allowFullScreen style={{position:'absolute',inset:0}} />
              Local:   <video width="100%" height="100%" controls src="/demo.mp4" style={{position:'absolute',inset:0}} />
            */}
          </div>
        </div>
      </section>

      {/* ── FREE EARLY ACCESS ── */}
      <section style={{background:'linear-gradient(135deg,#7C3AED 0%,#4C1D95 100%)',padding:'80px 24px',textAlign:'center'}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <p style={{fontSize:32,marginBottom:16}}>🎉</p>
          <h2 style={{fontSize:'clamp(24px,3vw,38px)',fontWeight:800,color:'white',marginBottom:16}}>Currently free for all early users</h2>
          <p style={{fontSize:17,color:'rgba(255,255,255,0.8)',marginBottom:12,lineHeight:1.7}}>
            Amana is completely free during our early access period. Create your account today and use all features at no cost.
          </p>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.55)',marginBottom:36}}>
            Paid plans may be introduced in the future to support continued development and advanced features. Early users will always have access to a generous free tier.
          </p>
          <Link href="/sign-up" style={{background:'white',color:'#7C3AED',fontSize:16,fontWeight:700,textDecoration:'none',padding:'14px 36px',borderRadius:12,display:'inline-block'}}>
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── CONTACT ── */}
      <ContactSection />

      {/* ── FOOTER ── */}
      <footer style={{background:'#111827',color:'white',padding:'48px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:40,marginBottom:40}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{width:30,height:30,background:'#7C3AED',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
                </div>
                <span style={{fontWeight:800,fontSize:16}}>Amana</span>
              </div>
              <p style={{fontSize:13,color:'#9CA3AF',lineHeight:1.7}}>The all-in-one business operations platform for small businesses worldwide.</p>
            </div>
            <div>
              <p style={{fontSize:13,fontWeight:700,color:'white',marginBottom:12,textTransform:'uppercase',letterSpacing:0.8}}>Product</p>
              {['Features','Pricing','Demo','FAQ'].map(l => <p key={l} style={{marginBottom:8}}><a href="#" style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>{l}</a></p>)}
            </div>
            <div>
              <p style={{fontSize:13,fontWeight:700,color:'white',marginBottom:12,textTransform:'uppercase',letterSpacing:0.8}}>Account</p>
              {[['Sign Up','/sign-up'],['Sign In','/sign-in']].map(([l,h]) => <p key={l} style={{marginBottom:8}}><Link href={h} style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>{l}</Link></p>)}
            </div>
            <div>
              <p style={{fontSize:13,fontWeight:700,color:'white',marginBottom:12,textTransform:'uppercase',letterSpacing:0.8}}>Legal</p>
              {[['Terms of Service','/terms'],['Privacy Policy','/privacy']].map(([l,h]) => <p key={l} style={{marginBottom:8}}><Link href={h} style={{fontSize:13,color:'#9CA3AF',textDecoration:'none'}}>{l}</Link></p>)}
            </div>
          </div>
          <div style={{borderTop:'1px solid #374151',paddingTop:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <p style={{fontSize:13,color:'#6B7280'}}>© {new Date().getFullYear()} Amana. All rights reserved.</p>
            <div style={{display:'flex',gap:20}}>
              <Link href="/terms" style={{fontSize:13,color:'#6B7280',textDecoration:'none'}}>Terms</Link>
              <Link href="/privacy" style={{fontSize:13,color:'#6B7280',textDecoration:'none'}}>Privacy</Link>
              <a href="#contact" style={{fontSize:13,color:'#6B7280',textDecoration:'none'}}>Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── FAQ Accordion (client component)
function FaqSection() {
  return (
    <section id="faq" style={{background:'#F9FAFB',padding:'80px 24px'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <p style={{fontSize:13,fontWeight:700,color:'#7C3AED',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>FAQ</p>
          <h2 style={{fontSize:'clamp(24px,3vw,38px)',fontWeight:800,color:'#111827'}}>Frequently asked questions</h2>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {FAQS.map((faq, i) => (
            <details key={i} style={{background:'white',borderRadius:12,border:'1px solid #E5E7EB',overflow:'hidden'}}>
              <summary style={{padding:'18px 20px',fontSize:15,fontWeight:600,color:'#111827',cursor:'pointer',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                {faq.q}
                <span style={{fontSize:20,color:'#7C3AED',flexShrink:0,marginLeft:12}}>+</span>
              </summary>
              <div style={{padding:'0 20px 18px',fontSize:14,color:'#6B7280',lineHeight:1.7,borderTop:'1px solid #F3F4F6'}}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Contact Section
function ContactSection() {
  return (
    <section id="contact" style={{background:'white',padding:'80px 24px'}}>
      <div style={{maxWidth:640,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <p style={{fontSize:13,fontWeight:700,color:'#7C3AED',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>Contact</p>
          <h2 style={{fontSize:'clamp(24px,3vw,36px)',fontWeight:800,color:'#111827',marginBottom:12}}>Get in touch</h2>
          <p style={{fontSize:16,color:'#6B7280'}}>Have a question or need help? We respond within 24 hours.</p>
          <p style={{fontSize:14,color:'#7C3AED',marginTop:8,fontWeight:500}}>support@amana.app</p>
        </div>
        <div style={{background:'#F9FAFB',borderRadius:16,padding:'32px',border:'1px solid #F3F4F6'}}>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div>
                <label style={{display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6}}>Your name</label>
                <input placeholder="John Doe" style={{width:'100%',height:44,padding:'0 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:14,outline:'none',boxSizing:'border-box',background:'white'}} />
              </div>
              <div>
                <label style={{display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6}}>Email address</label>
                <input type="email" placeholder="john@example.com" style={{width:'100%',height:44,padding:'0 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:14,outline:'none',boxSizing:'border-box',background:'white'}} />
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6}}>Message</label>
              <textarea placeholder="How can we help you?" rows={5} style={{width:'100%',padding:'12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:14,outline:'none',boxSizing:'border-box',resize:'vertical',background:'white',fontFamily:'inherit'}} />
            </div>
            <button style={{height:48,background:'#7C3AED',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:600,cursor:'pointer'}}>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
