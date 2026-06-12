import Link from 'next/link'

export default function RegistrationSuccessPage() {
  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px'}}>
      <div style={{width:'100%', maxWidth:390, background:'white', borderRadius:20, padding:'40px 24px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', border:'1px solid #F3F4F6', textAlign:'center'}}>
        <div style={{fontSize:64, marginBottom:20}}>🎉</div>
        <h2 style={{fontSize:22, fontWeight:700, color:'#111827', marginBottom:8}}>You're all set! 🎊</h2>
        <p style={{fontSize:14, color:'#6B7280', marginBottom:24}}>Your account has been verified and your business is ready.</p>
        <div style={{display:'inline-flex', alignItems:'center', gap:8, background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:24, padding:'8px 16px', marginBottom:32}}>
          <div style={{width:20, height:20, borderRadius:'50%', background:'#22C55E', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{fontSize:13, fontWeight:500, color:'#16A34A'}}>Account status: Verified</span>
        </div>
        <Link href="/sign-in" style={{display:'block', width:'100%', height:48, background:'#7C3AED', color:'white', borderRadius:12, fontSize:15, fontWeight:600, textDecoration:'none', lineHeight:'48px', textAlign:'center', boxSizing:'border-box'}}>
          Go to Sign In
        </Link>
      </div>
    </div>
  )
}
