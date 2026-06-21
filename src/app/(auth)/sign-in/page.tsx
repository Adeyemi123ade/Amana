'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { signInSchema, type SignInFormData } from '@/lib/validations/auth'

const field: React.CSSProperties = {width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white'}
const label: React.CSSProperties = {display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}
const err: React.CSSProperties = {fontSize:11, color:'#EF4444', marginTop:4}
const supabase = createClient()

export default function SignInPage() {
  const router = useRouter()

  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) })

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true); setServerError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
      if (error) { setServerError(error.message.includes('Invalid') ? 'That password does not match your account.' : 'Something went wrong. Please try again.'); return }
      // Middleware handles all routing after sign-in:
      // admin emails → /admin, customers → /dashboard
      window.location.href = '/'
    } catch { setServerError('Something went wrong. Please try again.') }
    finally { setIsLoading(false) }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  return (
    <div>
      {/* Back button — goes to landing page */}
      <div style={{marginBottom:20}}>
        <a href="/" style={{display:'inline-flex', alignItems:'center', gap:6, color:'#6B7280', textDecoration:'none', fontSize:13, fontWeight:500}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </a>
      </div>
      <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:4}}>Welcome back 👋</h2>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:20}}>Sign in to your Amana account</p>

      {serverError && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16}}>{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div>
            <label style={label}>Email address</label>
            <input type="email" style={field} placeholder="john@example.com" {...register('email')} />
            {errors.email && <p style={err}>{errors.email.message}</p>}
          </div>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
              <label style={{...label, marginBottom:0}}>Password</label>
              <Link href="/forgot-password" style={{fontSize:12, color:'#7C3AED', textDecoration:'none'}}>Forgot password?</Link>
            </div>
            <div style={{position:'relative'}}>
              <input type={showPwd ? 'text' : 'password'} style={{...field, paddingRight:40}} placeholder="••••••••" {...register('password')} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{position:'absolute', right:10, top:11, background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:16}}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p style={err}>{errors.password.message}</p>}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <input id="remember" type="checkbox" {...register('rememberMe')} style={{accentColor:'#7C3AED'}} />
            <label htmlFor="remember" style={{fontSize:13, color:'#6B7280'}}>Remember me</label>
          </div>
          <button type="submit" disabled={isLoading} style={{width:'100%', height:48, background:'#7C3AED', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity:isLoading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
            {isLoading && <span style={{width:16, height:16, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block'}} />}
            Sign In
          </button>
        </div>
      </form>

      <div style={{display:'flex', alignItems:'center', gap:10, margin:'16px 0'}}>
        <div style={{flex:1, height:1, background:'#E5E7EB'}} />
        <span style={{fontSize:12, color:'#9CA3AF'}}>Or continue with</span>
        <div style={{flex:1, height:1, background:'#E5E7EB'}} />
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        <button onClick={handleGoogle} style={{width:'100%', height:44, background:'white', border:'1px solid #E5E7EB', borderRadius:10, fontSize:14, color:'#374151', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontWeight:500}}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <button style={{width:'100%', height:44, background:'white', border:'1px solid #E5E7EB', borderRadius:10, fontSize:14, color:'#374151', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontWeight:500}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Continue with Apple
        </button>
      </div>

      <p style={{textAlign:'center', fontSize:13, color:'#6B7280', marginTop:16}}>
        Don't have an account?{' '}
        <Link href="/sign-up" style={{color:'#7C3AED', fontWeight:500, textDecoration:'none'}}>Sign up</Link>
      </p>

      <div style={{display:'flex', justifyContent:'center', gap:16, marginTop:16, paddingTop:16, borderTop:'1px solid #F3F4F6'}}>
        <Link href="/terms" style={{fontSize:11, color:'#9CA3AF', textDecoration:'none'}}>Terms of Service</Link>
        <Link href="/privacy" style={{fontSize:11, color:'#9CA3AF', textDecoration:'none'}}>Privacy Policy</Link>
      </div>
    </div>
  )
}
