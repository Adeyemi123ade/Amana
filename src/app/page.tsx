import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{background: '#1a0f3c'}}>
      <div className="flex flex-col min-h-screen w-full max-w-sm mx-auto px-5">

        {/* Top nav */}
        <div className="flex items-center justify-between pt-5 pb-2">
          <div className="flex items-center gap-2">
            <div style={{background:'#7C3AED', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{color:'white', fontWeight:700, fontSize:16}}>ROS</span>
          </div>
          <button style={{display:'flex', flexDirection:'column', gap:5, padding:4}}>
            <span style={{display:'block', height:2, width:20, background:'white', borderRadius:2}}></span>
            <span style={{display:'block', height:2, width:20, background:'white', borderRadius:2}}></span>
            <span style={{display:'block', height:2, width:20, background:'white', borderRadius:2}}></span>
          </button>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <h1 style={{fontSize:34, fontWeight:800, color:'white', lineHeight:1.2, marginBottom:16}}>
            Run your business.<br/>
            Get paid faster.<br/>
            <span style={{color:'#A78BFA'}}>Stay organized.</span>
          </h1>

          <p style={{color:'#9CA3AF', fontSize:14, lineHeight:1.6, marginBottom:24}}>
            The all-in-one platform to manage invoices, customers, appointments and grow your business.
          </p>

          <ul style={{listStyle:'none', padding:0, margin:'0 0 32px 0', display:'flex', flexDirection:'column', gap:12}}>
            {[
              'Create invoices in seconds',
              'Track payments automatically',
              'Never miss a booking again',
            ].map(item => (
              <li key={item} style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{background:'#7C3AED', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span style={{color:'#D1D5DB', fontSize:13}}>{item}</span>
              </li>
            ))}
          </ul>

          <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:32}}>
            <Link href="/sign-up" style={{background:'#7C3AED', color:'white', textAlign:'center', padding:'14px 24px', borderRadius:12, fontWeight:600, fontSize:15, textDecoration:'none', display:'block'}}>
              Get Started Free
            </Link>
            <Link href="/sign-in" style={{background:'transparent', color:'white', textAlign:'center', padding:'14px 24px', borderRadius:12, fontWeight:600, fontSize:15, textDecoration:'none', display:'block', border:'1px solid rgba(255,255,255,0.25)'}}>
              Watch Demo ▶
            </Link>
          </div>

          {/* Social proof */}
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{display:'flex'}}>
              {['#7C3AED','#6D28D9','#5B21B6','#4C1D95','#3B0764'].map((c,i) => (
                <div key={i} style={{width:32, height:32, borderRadius:'50%', background:c, border:'2px solid #1a0f3c', marginLeft: i > 0 ? -8 : 0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white'}}>
                  {String.fromCharCode(65+i)}
                </div>
              ))}
            </div>
            <p style={{color:'#9CA3AF', fontSize:12}}>
              Trusted by <strong style={{color:'white'}}>12,000+</strong> businesses
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
