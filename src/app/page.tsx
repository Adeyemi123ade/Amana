import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(160deg,#1a0f3c 0%,#2d1b69 50%,#1a0f3c 100%)', display:'flex', flexDirection:'column'}}>
      <div style={{maxWidth:480, width:'100%', margin:'0 auto', padding:'0 20px', display:'flex', flexDirection:'column', minHeight:'100vh'}}>

        {/* Nav */}
        <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:20, paddingBottom:8}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{width:32, height:32, background:'#7C3AED', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{color:'white', fontWeight:700, fontSize:16, letterSpacing:-0.3}}>ROS</span>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:4, cursor:'pointer', padding:4}}>
            <span style={{display:'block', width:20, height:2, background:'white', borderRadius:2}}/>
            <span style={{display:'block', width:20, height:2, background:'white', borderRadius:2}}/>
            <span style={{display:'block', width:20, height:2, background:'white', borderRadius:2}}/>
          </div>
        </nav>

        {/* Hero */}
        <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', paddingTop:32, paddingBottom:40}}>
          <h1 style={{fontSize:'clamp(28px, 7vw, 38px)', fontWeight:800, color:'white', lineHeight:1.2, marginBottom:16}}>
            Run your business.<br/>
            Get paid faster.<br/>
            <span style={{color:'#A78BFA'}}>Stay organized.</span>
          </h1>
          <p style={{color:'#9CA3AF', fontSize:14, lineHeight:1.7, marginBottom:28}}>
            The all-in-one platform to manage invoices, customers, appointments and grow your business.
          </p>
          <ul style={{listStyle:'none', marginBottom:32, display:'flex', flexDirection:'column', gap:10}}>
            {['Create invoices in seconds','Track payments automatically','Never miss a booking again'].map(t => (
              <li key={t} style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{width:20, height:20, background:'#7C3AED', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span style={{color:'#D1D5DB', fontSize:13}}>{t}</span>
              </li>
            ))}
          </ul>
          <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:36}}>
            <Link href="/sign-up" style={{background:'#7C3AED', color:'white', textAlign:'center', padding:'15px 24px', borderRadius:12, fontWeight:600, fontSize:15, textDecoration:'none', display:'block'}}>
              Get Started Free
            </Link>
            <Link href="/sign-in" style={{background:'transparent', color:'white', textAlign:'center', padding:'15px 24px', borderRadius:12, fontWeight:600, fontSize:15, textDecoration:'none', display:'block', border:'1px solid rgba(255,255,255,0.3)'}}>
              Watch Demo ▶
            </Link>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{display:'flex'}}>
              {['#7C3AED','#6D28D9','#5B21B6','#4C1D95','#3B0764'].map((c,i) => (
                <div key={i} style={{width:30, height:30, borderRadius:'50%', background:c, border:'2px solid #1a0f3c', marginLeft:i>0?-6:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white'}}>
                  {String.fromCharCode(65+i)}
                </div>
              ))}
            </div>
            <p style={{color:'#9CA3AF', fontSize:12}}>Trusted by <strong style={{color:'white'}}>12,000+</strong> businesses</p>
          </div>
        </div>
      </div>
    </main>
  )
}
