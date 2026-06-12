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

function getSupabaseErrorMessage(error: any): string {
  const msg = error?.message || ''
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) {
    return 'This email is already registered. Please sign in or use a different email.'
  }
  if (msg.includes('invalid email') || msg.includes('Invalid email')) {
    return 'Please enter a valid email address.'
  }
  if (msg.includes('Password should be at least') || msg.includes('weak password')) {
    return 'Your password must include uppercase, lowercase, number, and special character.'
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch')) {
    return 'We could not connect. Please check your internet connection and try again.'
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many signup attempts. Please wait a few minutes and try again.'
  }
  if (msg) {
    return `Signup failed: ${msg}`
  }
  return 'We could not complete your signup right now. Please try again shortly.'
}

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pwdValue, setPwdValue] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === 'NG') || COUNTRIES[0])
  const [phoneValue, setPhoneValue] = useState(selectedCountry.dial + ' ')

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

    // Client-side validation
    if (!data.fullName?.trim()) { setServerError('Please enter your full name.'); setIsLoading(false); return }
    if (!data.email?.trim()) { setServerError('Please enter your email address.'); setIsLoading(false); return }
    if (!data.phone?.trim() || data.phone.trim() === selectedCountry.dial) { setServerError('Please enter a valid phone number for the selected country.'); setIsLoading(false); return }
    if (!data.termsAccepted) { setServerError('Please accept the Terms of Service and Privacy Policy to continue.'); setIsLoading(false); return }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            phone: data.phone.trim(),
            country: data.country,
          },
        },
      })

      if (error) {
        setServerError(getSupabaseErrorMessage(error))
        return
      }

      if (authData.user && !authData.session) {
        // Email confirmation required - OTP sent
        sessionStorage.setItem('ros_verify_email', data.email.trim().toLowerCase())
        router.push('/verify-email')
        return
      }

      if (authData.session) {
        // Auto-confirmed (email confirmation disabled in Supabase)
        router.push('/onboarding/identity-verification')
        return
      }

      setServerError('Signup completed but could not verify status. Please try signing in.')
    } catch (err: any) {
      if (err?.message?.includes('fetch') || err?.name === 'TypeError') {
        setServerError('We could not connect. Please check your internet connection and try again.')
      } else {
        setServerError('We could not complete your signup right now. Please try again shortly.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:700,color:'#111827',marginBottom:4}}>Create your account</h2>
      <p style={{fontSize:13,color:'#6B7280',marginBottom:20}}>Let's get your business account set up.</p>

      {serverError && (
        <div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#DC2626',marginBottom:16,lineHeight:1.5}}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>

          {/* Country selector */}
          <div>
            <label style={lbl}>Country</label>
            <select
              value={selectedCountry.code}
              onChange={e => handleCountryChange(e.target.value)}
              style={field}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>
              ))}
            </select>
          </div>

          {/* Full name */}
          <div>
            <label style={lbl}>Full name</label>
            <input style={field} placeholder="John Doe" {...register('fullName')} />
            {errors.fullName && <p style={errStyle}>{errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={lbl}>Email address</label>
            <input type="email" style={field} placeholder="john@example.com" {...register('email')} />
            {errors.email && <p style={errStyle}>{errors.email.message}</p>}
          </div>

          {/* Phone — auto-populated with dial code */}
          <div>
            <label style={lbl}>Phone number</label>
            <input
              type="tel"
              style={field}
              value={phoneValue}
              onChange={e => {
                setPhoneValue(e.target.value)
                setValue('phone', e.target.value)
              }}
              placeholder={`${selectedCountry.dial} 812 345 6789`}
            />
            {errors.phone && <p style={errStyle}>{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={lbl}>Password</label>
            <div style={{position:'relative'}}>
              <input
                type={showPwd ? 'text' : 'password'}
                style={{...field, paddingRight:40}}
                placeholder="Create a strong password"
                {...register('password')}
                onChange={e => { setPwdValue(e.target.value) }}
              />
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
                    {label:'At least 8 characters', met: pwdValue.length >= 8},
                    {label:'Uppercase letter (A-Z)', met: /[A-Z]/.test(pwdValue)},
                    {label:'Lowercase letter (a-z)', met: /[a-z]/.test(pwdValue)},
                    {label:'Number (0-9)', met: /[0-9]/.test(pwdValue)},
                    {label:'Special character (!@#$)', met: /[^A-Za-z0-9]/.test(pwdValue)},
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

          {/* Confirm password */}
          <div>
            <label style={lbl}>Confirm password</label>
            <div style={{position:'relative'}}>
              <input type={showCfm ? 'text' : 'password'} style={{...field, paddingRight:40}} placeholder="Repeat your password" {...register('confirmPassword')} />
              <button type="button" onClick={() => setShowCfm(!showCfm)} style={{position:'absolute',right:10,top:11,background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',fontSize:16}}>
                {showCfm ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword.message}</p>}
          </div>

          {/* Terms */}
          <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
            <input id="terms" type="checkbox" {...register('termsAccepted')} style={{marginTop:2,accentColor:'#7C3AED',flexShrink:0}} />
            <label htmlFor="terms" style={{fontSize:12,color:'#6B7280',lineHeight:1.6}}>
              I agree to the{' '}
              <Link href="/terms" target="_blank" style={{color:'#7C3AED',textDecoration:'none',fontWeight:500}}>Terms of Service</Link>
              {' '}and{' '}
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
        Already have an account?{' '}
        <Link href="/sign-in" style={{color:'#7C3AED',fontWeight:500,textDecoration:'none'}}>Sign in</Link>
      </p>
    </div>
  )
}
