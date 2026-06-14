'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function VerifyEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['','','','','',''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadEmail = async () => {
      // First check sessionStorage (set during signup)
      const stored = sessionStorage.getItem('ros_verify_email')
      if (stored) { setEmail(stored); return }

      // Otherwise get from logged-in user session
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
        sessionStorage.setItem('ros_verify_email', user.email)
      } else {
        router.replace('/sign-up')
      }
    }
    loadEmail()
  }, [router])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setCanResend(true)
    }
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
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const n = [...otp]
    p.split('').forEach((c, i) => { if (i < 6) n[i] = c })
    setOtp(n)
    document.getElementById(`o${Math.min(p.length, 5)}`)?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit code.'); return }
    setIsVerifying(true)
    setError('')

    try {
      // Get the current user (they are logged in because mailer_autoconfirm is true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Your session has expired. Please sign up again.')
        return
      }

      const storedCode = user.user_metadata?.verification_code
      const expiresAt = user.user_metadata?.verification_expires

      if (!storedCode) {
        setError('No verification code found. Please request a new one.')
        return
      }

      if (Date.now() > expiresAt) {
        setError('This code has expired. Please request a new one.')
        return
      }

      if (storedCode !== code) {
        setError('Incorrect code. Please check and try again.')
        setOtp(['','','','','',''])
        document.getElementById('o0')?.focus()
        return
      }

      // Code is correct — mark email as verified
      await supabase.auth.updateUser({
        data: {
          email_verified: true,
          verification_code: null,
          verification_expires: null,
        },
      })

      setSuccess(true)
      setTimeout(() => {
        sessionStorage.removeItem('ros_verify_email')
        router.push('/onboarding/business-information')
      }, 1500)

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')

    try {
      // Generate new code
      const code = String(Math.floor(100000 + Math.random() * 900000))
      const expiresAt = Date.now() + 10 * 60 * 1000

      // Update user metadata with new code
      await supabase.auth.updateUser({
        data: { verification_code: code, verification_expires: expiresAt },
      })

      // Send via our API route
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(`Could not send email: ${data.detail || data.error || 'Unknown error'}`)
        return
      }

      setCountdown(60)
      setCanResend(false)
      setOtp(['','','','','',''])
      document.getElementById('o0')?.focus()
    } catch {
      setError('Could not resend. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div style={{textAlign:'center'}}>
        <div style={{width:72,height:72,borderRadius:'50%',background:'#F0FDF4',border:'3px solid #22C55E',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 style={{fontSize:20,fontWeight:700,color:'#111827',marginBottom:8}}>Email Verified!</h2>
        <p style={{fontSize:13,color:'#6B7280'}}>Redirecting you to set up your business...</p>
      </div>
    )
  }

  return (
    <div style={{textAlign:'center'}}>
      <div style={{width:72,height:72,borderRadius:'50%',background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="3" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5"/>
          <path d="M2 8l10 6 10-6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 style={{fontSize:20,fontWeight:700,color:'#111827',marginBottom:8}}>Enter verification code</h2>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:4}}>We sent a 6-digit code to</p>
      <p style={{fontSize:14,fontWeight:600,color:'#111827',marginBottom:24}}>{email}</p>

      {error && (
        <div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#DC2626',marginBottom:16,textAlign:'left'}}>
          {error}
        </div>
      )}

      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:24}}>
        {otp.map((d, i) => (
          <input key={i} id={`o${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKey(i, e)}
            onPaste={handlePaste}
            style={{width:44,height:52,borderRadius:10,border:d?'2px solid #7C3AED':'1.5px solid #E5E7EB',textAlign:'center',fontSize:20,fontWeight:700,color:'#111827',background:d?'#F5F3FF':'white',outline:'none'}} />
        ))}
      </div>

      <button onClick={handleVerify} disabled={isVerifying || otp.join('').length !== 6}
        style={{width:'100%',height:48,background:'#7C3AED',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:600,cursor:'pointer',opacity:otp.join('').length!==6?0.5:1,marginBottom:16,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        {isVerifying && <span style={{width:16,height:16,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>}
        Verify Email
      </button>

      <p style={{fontSize:13,color:'#6B7280',marginBottom:8}}>
        Didn't receive the code?{' '}
        {canResend ? (
          <button onClick={handleResend} disabled={isResending}
            style={{color:'#7C3AED',background:'none',border:'none',cursor:'pointer',fontWeight:600,fontSize:13}}>
            {isResending ? 'Sending...' : 'Resend code'}
          </button>
        ) : (
          <span>Resend in <strong>{countdown}s</strong></span>
        )}
      </p>

      <p style={{fontSize:12,color:'#9CA3AF',marginTop:16}}>
        Check your spam folder if you do not see the email.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
