'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'waiting'|'otp'>('waiting')
  const [otp, setOtp] = useState(['','','','','',''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const s = sessionStorage.getItem('ros_verify_email')
    if (!s) { router.replace('/sign-up'); return }
    setEmail(s)
  }, [router])

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c-1), 1000); return () => clearTimeout(t) }
    else setCanResend(true)
  }, [countdown])

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const n = [...otp]; n[i] = v; setOtp(n)
    if (v && i < 5) document.getElementById(`o${i+1}`)?.focus()
  }
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`o${i-1}`)?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    const n = [...otp]; p.split('').forEach((c,i) => { if(i<6) n[i]=c }); setOtp(n)
    document.getElementById(`o${Math.min(p.length,5)}`)?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit code.'); return }
    setIsVerifying(true); setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
      if (error) { setError(error.message.includes('expired') ? 'Code expired. Request a new one.' : 'Incorrect code. Please try again.'); setOtp(['','','','','','']); document.getElementById('o0')?.focus(); return }
      router.push('/onboarding/identity-verification')
    } catch { setError('Something went wrong.') }
    finally { setIsVerifying(false) }
  }

  const handleResend = async () => {
    setIsResending(true); setError('')
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) { setError('Could not resend. Please try again.'); return }
      setCountdown(30); setCanResend(false); setOtp(['','','','','',''])
    } catch { setError('Something went wrong.') }
    finally { setIsResending(false) }
  }

  const box: React.CSSProperties = {position:'relative', background:'#F5F3FF', borderRadius:12, padding:24, textAlign:'center', marginBottom:24}
  const iconWrap: React.CSSProperties = {width:72, height:72, borderRadius:'50%', background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}

  if (step === 'waiting') return (
    <div style={{textAlign:'center'}}>
      <div style={iconWrap}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="3" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5"/>
          <path d="M2 8l10 6 10-6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="18" cy="16" r="4" fill="#7C3AED"/>
          <path d="M16 16l1.5 1.5L20 14" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:8}}>Verify your email</h2>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:4}}>We've sent a verification link to</p>
      <p style={{fontSize:14, fontWeight:600, color:'#111827', marginBottom:4}}>{email}</p>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:24}}>Please check your inbox and click the link to verify your account.</p>
      <button onClick={() => window.open('mailto:','_blank')} style={{width:'100%', height:48, background:'#7C3AED', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', marginBottom:16}}>
        Open Email App
      </button>
      <button onClick={() => setStep('otp')} style={{width:'100%', height:44, background:'white', color:'#7C3AED', border:'1px solid #7C3AED', borderRadius:12, fontSize:14, fontWeight:500, cursor:'pointer', marginBottom:12}}>
        Enter Code Manually
      </button>
      <p style={{fontSize:13, color:'#6B7280'}}>
        {canResend
          ? <button onClick={handleResend} disabled={isResending} style={{color:'#7C3AED', background:'none', border:'none', cursor:'pointer', fontWeight:500}}>{isResending ? 'Resending...' : 'Resend email'}</button>
          : <span>Resend email <strong>({countdown}s)</strong></span>}
      </p>
    </div>
  )

  return (
    <div style={{textAlign:'center'}}>
      <div style={iconWrap}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:8}}>Enter verification code</h2>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:4}}>We sent a 6-digit code to</p>
      <p style={{fontSize:14, fontWeight:600, color:'#111827', marginBottom:24}}>{email}</p>
      {error && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16}}>{error}</div>}
      <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:24}}>
        {otp.map((d,i) => (
          <input key={i} id={`o${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKey(i, e)}
            onPaste={handlePaste}
            style={{width:44, height:52, borderRadius:10, border: d ? '2px solid #7C3AED' : '1.5px solid #E5E7EB', textAlign:'center', fontSize:20, fontWeight:700, color:'#111827', background: d ? '#F5F3FF' : 'white', outline:'none'}}
          />
        ))}
      </div>
      <button onClick={handleVerify} disabled={isVerifying || otp.join('').length !== 6}
        style={{width:'100%', height:48, background:'#7C3AED', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity: otp.join('').length !== 6 ? 0.5 : 1, marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
        {isVerifying && <span style={{width:16, height:16, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block'}} />}
        Verify Email
      </button>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:8}}>
        {canResend
          ? <button onClick={handleResend} disabled={isResending} style={{color:'#7C3AED', background:'none', border:'none', cursor:'pointer', fontWeight:500}}>{isResending ? 'Resending...' : 'Resend code'}</button>
          : <span>Resend code <strong>({countdown}s)</strong></span>}
      </p>
      <button onClick={() => setStep('waiting')} style={{color:'#9CA3AF', background:'none', border:'none', cursor:'pointer', fontSize:12}}>Back</button>
    </div>
  )
}
