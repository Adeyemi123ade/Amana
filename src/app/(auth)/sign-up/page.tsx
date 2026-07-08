'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'
import { validatePassword } from '@/lib/utils'
import { COUNTRIES } from '@/lib/utils/countries'

const field: React.CSSProperties = { width:'100%',height:44,padding:'0 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:14,color:'#111827',outline:'none',boxSizing:'border-box',background:'white' }
const lbl: React.CSSProperties = { display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6 }
const errStyle: React.CSSProperties = { fontSize:11,color:'#EF4444',marginTop:4 }
const supabase = createClient()

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export default function SignUpPage() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pwdValue, setPwdValue] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === 'NG') || COUNTRIES[0])
  const [phoneValue, setPhoneValue] = useState(selectedCountry.dial + ' ')
  const [checking, setChecking] = useState(true)

  // Defense-in-depth: if the browser's back button restores a cached copy of this page
  // for a user who has already signed up (even if unverified), send them forward again
  // instead of letting them resubmit the form and hit an "already registered" dead end.
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.replace(user.user_metadata?.email_verified === false ? '/verify-email' : '/dashboard')
        return
      }
      setChecking(false)
    }
    check()
  }, [router])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { country: 'NG' },
  })

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code) || COUNTRIES[0]
    setSelectedCountry(country)
    setPhoneValue(country.dial + ' ')
    setValue('country', code)
    setValue('phone', country.dial + ' ')
  }

  const strength = validatePassword(pwdValue)
  const strengthColor = strength === 'Strong' ? '#22C55E' : strength === 'Medium' ? '#F59E0B' : '#EF4444'
  const strengthWidth = strength === 'Strong' ? '100%' : strength === 'Medium' ? '66%' : '33%'

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setServerError('')

    if (!data.fullName?.trim()) { setServerError('Please enter your full name.'); setIsLoading(false); return }
    if (!data.email?.trim()) { setServerError('Please enter your email address.'); setIsLoading(false); return }
    if (!data.phone?.trim() || data.phone.trim() === selectedCountry.dial) { setServerError('Please enter your phone number.'); setIsLoading(false); return }
    if (!data.termsAccepted) { setServerError('Please accept the Terms of Service and Privacy Policy.'); setIsLoading(false); return }

    try {
      // Generate OTP
      const code = generateOTP()
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

      // Sign up user with autoconfirm ON in Supabase
      // Store the OTP in user metadata so we can verify it later
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            phone: data.phone.trim(),
            country: data.country,
            verification_code: code,
            verification_expires: expiresAt,
            email_verified: false,
          },
        },
      })

      if (error) {
        const msg = error.message || ''
        if (msg.includes('already registered') || msg.includes('already exists')) {
          setServerError('This email is already registered. Please sign in instead.')
        } else if (msg.includes('password')) {
          setServerError('Your password must include uppercase, lowercase, number, and special character.')
        } else if (msg.includes('rate limit')) {
          setServerError('Too many attempts. Please wait a few minutes and try again.')
        } else {
          setServerError(`Signup failed: ${msg}`)
        }
        return
      }

      if (!authData.user) {
        setServerError('We could not create your account. Please try again.')
        return
      }

      // Send verification email via our own API route (bypasses Supabase SMTP)
      const emailRes = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim().toLowerCase(), code }),
      })

      const emailData = await emailRes.json()

      if (!emailRes.ok) {
        // Email failed — show the user exactly what happened
        // The account was created so we still go to verify, but they need to know
        const reason = emailData?.detail || emailData?.error || 'Unknown error'
        const isConfig = reason.toLowerCase().includes('api key') || reason.toLowerCase().includes('configure')

        // Store email so verify page still works (they can resend from there)
        sessionStorage.setItem('ros_verify_email', data.email.trim().toLowerCase())
        sessionStorage.setItem('ros_email_failed', '1')

        if (isConfig) {
          setServerError('Email service is not configured. Please contact support.')
          setIsLoading(false)
          return
        }

        // Non-config error — go to verify page and let them resend
        sessionStorage.setItem('ros_email_error', `We could not send your verification code: ${reason}. Please use the Resend button on the next screen.`)
      }

      // Store email for the verify page
      sessionStorage.setItem('ros_verify_email', data.email.trim().toLowerCase())
      router.push('/verify-email')

    } catch (err: any) {
      if (err?.message?.includes('fetch') || err?.name === 'TypeError') {
        setServerError('Could not connect. Please check your internet and try again.')
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
        <span style={{ width:20, height:20, border:'2px solid #7C3AED', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:700,color:'#111827',marginBottom:4}}>Create your account</h2>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:20}}>Let's get your business set up on Amana.</p>

      {serverError && (
        <div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#DC2626',marginBottom:16,lineHeight:1.5}}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={lbl}>Country</label>
            <select value={selectedCountry.code} onChange={e => handleCountryChange(e.target.value)} style={field}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Full name</label>
            <input style={field} placeholder="John Doe" {...register('fullName')} />
            {errors.fullName && <p style={errStyle}>{errors.fullName.message}</p>}
          </div>
          <div>
            <label style={lbl}>Email address</label>
            <input type="email" style={field} placeholder="john@example.com" {...register('email')} />
            {errors.email && <p style={errStyle}>{errors.email.message}</p>}
          </div>
          <div>
            <label style={lbl}>Phone number</label>
            <input type="tel" style={field} value={phoneValue}
              onChange={e => { setPhoneValue(e.target.value); setValue('phone', e.target.value) }}
              placeholder={`${selectedCountry.dial} 812 345 6789`} />
            {errors.phone && <p style={errStyle}>{errors.phone.message}</p>}
          </div>
          <div>
            <label style={lbl}>Password</label>
            <div style={{position:'relative'}}>
              <input type={showPwd?'text':'password'} style={{...field,paddingRight:40}} placeholder="Create a strong password"
                {...register('password', { onChange: (e) => setPwdValue(e.target.value) })} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{position:'absolute',right:10,top:11,background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',fontSize:16}}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {pwdValue && (
              <div style={{marginTop:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:11,color:'#6B7280'}}>Password strength</span>
                  <span style={{fontSize:11,color:strengthColor,fontWeight:600}}>{strength}</span>
                </div>
                <div style={{height:4,background:'#F3F4F6',borderRadius:4}}>
                  <div style={{height:4,borderRadius:4,background:strengthColor,width:strengthWidth,transition:'all 0.3s'}}/>
                </div>
                <ul style={{marginTop:6,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:2}}>
                  {[
                    {label:'At least 8 characters',met:pwdValue.length>=8},
                    {label:'Uppercase letter (A-Z)',met:/[A-Z]/.test(pwdValue)},
                    {label:'Lowercase letter (a-z)',met:/[a-z]/.test(pwdValue)},
                    {label:'Number (0-9)',met:/[0-9]/.test(pwdValue)},
                    {label:'Special character (!@#$)',met:/[^A-Za-z0-9]/.test(pwdValue)},
                  ].map(c => (
                    <li key={c.label} style={{display:'flex',alignItems:'center',gap:6,fontSize:11}}>
                      <span style={{color:c.met?'#22C55E':'#D1D5DB'}}>{c.met?'✓':'○'}</span>
                      <span style={{color:c.met?'#374151':'#9CA3AF'}}>{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.password && <p style={errStyle}>{errors.password.message}</p>}
          </div>
          <div>
            <label style={lbl}>Confirm password</label>
            <div style={{position:'relative'}}>
              <input type={showCfm?'text':'password'} style={{...field,paddingRight:40}} placeholder="Repeat your password" {...register('confirmPassword')} />
              <button type="button" onClick={() => setShowCfm(!showCfm)} style={{position:'absolute',right:10,top:11,background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',fontSize:16}}>
                {showCfm ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword.message}</p>}
          </div>
          <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
            <input id="terms" type="checkbox" {...register('termsAccepted')} style={{marginTop:2,accentColor:'#7C3AED',flexShrink:0}} />
            <label htmlFor="terms" style={{fontSize:12,color:'#6B7280',lineHeight:1.6}}>
              I agree to the <Link href="/terms" target="_blank" style={{color:'#7C3AED',textDecoration:'none',fontWeight:500}}>Terms of Service</Link>{' '}and{' '}
              <Link href="/privacy" target="_blank" style={{color:'#7C3AED',textDecoration:'none',fontWeight:500}}>Privacy Policy</Link>
            </label>
          </div>
          {errors.termsAccepted && <p style={errStyle}>{errors.termsAccepted.message}</p>}
          <button type="submit" disabled={isLoading} style={{width:'100%',height:48,background:'#7C3AED',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:600,cursor:'pointer',opacity:isLoading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:4}}>
            {isLoading && <span style={{width:16,height:16,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>}
            Create Account
          </button>
        </div>
      </form>
      <p style={{textAlign:'center',fontSize:13,color:'#6B7280',marginTop:16}}>
        Already have an account? <Link href="/sign-in" style={{color:'#7C3AED',fontWeight:500,textDecoration:'none'}}>Sign in</Link>
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
