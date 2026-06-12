'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'
import { validatePassword } from '@/lib/utils'

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria (+234)' },
  { code: 'GH', name: 'Ghana (+233)' },
  { code: 'KE', name: 'Kenya (+254)' },
  { code: 'ZA', name: 'South Africa (+27)' },
  { code: 'GB', name: 'United Kingdom (+44)' },
  { code: 'US', name: 'United States (+1)' },
]

const field: React.CSSProperties = {
  width:'100%', height:44, padding:'0 12px', borderRadius:8,
  border:'1px solid #E5E7EB', fontSize:14, color:'#111827',
  outline:'none', boxSizing:'border-box', background:'white',
}
const label: React.CSSProperties = {
  display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6,
}
const err: React.CSSProperties = { fontSize:11, color:'#EF4444', marginTop:4 }

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pwdValue, setPwdValue] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { country: 'NG' },
  })

  const strength = validatePassword(pwdValue)
  const strengthColor = strength === 'Strong' ? '#22C55E' : strength === 'Medium' ? '#F59E0B' : '#EF4444'
  const strengthWidth = strength === 'Strong' ? '100%' : strength === 'Medium' ? '66%' : '33%'

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setServerError('')
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName, phone: data.phone, country: data.country } },
      })
      if (error) {
        setServerError(error.message.includes('already registered') ? 'An account already exists with this email.' : 'Something went wrong. Please try again.')
        return
      }
      sessionStorage.setItem('ros_verify_email', data.email)
      router.push('/verify-email')
    } catch { setServerError('Something went wrong. Please try again.') }
    finally { setIsLoading(false) }
  }

  return (
    <div>
      <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:4}}>Create your account</h2>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:20}}>Let's get your business account set up.</p>

      {serverError && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16}}>{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>

          <div>
            <label style={label}>Country</label>
            <select {...register('country')} style={{...field, paddingRight:32}}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={label}>Full name</label>
            <input style={field} placeholder="John Doe" {...register('fullName')} />
            {errors.fullName && <p style={err}>{errors.fullName.message}</p>}
          </div>

          <div>
            <label style={label}>Email address</label>
            <input type="email" style={field} placeholder="john@example.com" {...register('email')} />
            {errors.email && <p style={err}>{errors.email.message}</p>}
          </div>

          <div>
            <label style={label}>Phone number</label>
            <input type="tel" style={field} placeholder="+234 812 345 6789" {...register('phone')} />
            {errors.phone && <p style={err}>{errors.phone.message}</p>}
          </div>

          <div>
            <label style={label}>Password</label>
            <div style={{position:'relative'}}>
              <input
                type={showPwd ? 'text' : 'password'}
                style={{...field, paddingRight:40}}
                placeholder="••••••••"
                {...register('password')}
                onChange={e => setPwdValue(e.target.value)}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{position:'absolute', right:10, top:11, background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:16}}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {pwdValue && (
              <div style={{marginTop:8}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                  <span style={{fontSize:11, color:'#6B7280'}}>Password strength</span>
                  <span style={{fontSize:11, color:strengthColor, fontWeight:600}}>{strength}</span>
                </div>
                <div style={{height:4, background:'#F3F4F6', borderRadius:4}}>
                  <div style={{height:4, borderRadius:4, background:strengthColor, width:strengthWidth, transition:'all 0.3s'}} />
                </div>
                <ul style={{marginTop:6, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:2}}>
                  {[
                    {label:'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(pwdValue)},
                    {label:'At least one lowercase letter (a-z)', met: /[a-z]/.test(pwdValue)},
                    {label:'At least one number (0-9)', met: /[0-9]/.test(pwdValue)},
                    {label:'At least one special character (!@#$*)', met: /[^A-Za-z0-9]/.test(pwdValue)},
                  ].map(c => (
                    <li key={c.label} style={{display:'flex', alignItems:'center', gap:6, fontSize:11}}>
                      <span style={{color: c.met ? '#22C55E' : '#D1D5DB'}}>{c.met ? '✓' : '○'}</span>
                      <span style={{color: c.met ? '#374151' : '#9CA3AF'}}>{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.password && <p style={err}>{errors.password.message}</p>}
          </div>

          <div>
            <label style={label}>Confirm password</label>
            <div style={{position:'relative'}}>
              <input type={showCfm ? 'text' : 'password'} style={{...field, paddingRight:40}} placeholder="••••••••" {...register('confirmPassword')} />
              <button type="button" onClick={() => setShowCfm(!showCfm)} style={{position:'absolute', right:10, top:11, background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:16}}>
                {showCfm ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && <p style={err}>{errors.confirmPassword.message}</p>}
          </div>

          <div style={{display:'flex', alignItems:'flex-start', gap:8}}>
            <input id="terms" type="checkbox" {...register('termsAccepted')} style={{marginTop:2, accentColor:'#7C3AED', flexShrink:0}} />
            <label htmlFor="terms" style={{fontSize:12, color:'#6B7280', lineHeight:1.5}}>
              I agree to the <span style={{color:'#7C3AED'}}>Terms of Service</span> and <span style={{color:'#7C3AED'}}>Privacy Policy</span>
            </label>
          </div>
          {errors.termsAccepted && <p style={err}>{errors.termsAccepted.message}</p>}

          <button type="submit" disabled={isLoading} style={{width:'100%', height:48, background:'#7C3AED', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity: isLoading ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
            {isLoading && <span style={{width:16, height:16, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}} />}
            Create Account
          </button>
        </div>
      </form>

      <p style={{textAlign:'center', fontSize:13, color:'#6B7280', marginTop:16}}>
        Already have an account?{' '}
        <Link href="/sign-in" style={{color:'#7C3AED', fontWeight:500, textDecoration:'none'}}>Sign in</Link>
      </p>
    </div>
  )
}
