'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { signInSchema, type SignInFormData } from '@/lib/validations/auth'

const field: React.CSSProperties = {width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white'}
const lbl: React.CSSProperties = {display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}
const errStyle: React.CSSProperties = {fontSize:11, color:'#EF4444', marginTop:4}
const supabase = createClient()

const SUPER_ADMIN_EMAILS = ['admin@amana.app', 'admin@kajolacooperative.com']

// Determines where to redirect a logged-in user
// Checks hardcoded super admins first, then checks platform_admins table for invited admins
async function getDestination(email: string): Promise<string> {
  if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) return '/admin'
  try {
    const res = await fetch('/api/admin/check-role?email=' + encodeURIComponent(email.toLowerCase()))
    if (res.ok) {
      const data = await res.json()
      if (data.isAdmin) return '/admin'
    }
  } catch {}
  return '/dashboard'
}

export default function SignInPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema)
  })

  // Back button fix: if user is already logged in, send them to their correct dashboard
  // This works for super admins AND invited admins
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const dest = await getDestination(user.email)
        window.location.replace(dest)
        return
      }
      setChecking(false)
    }
    check()
  }, [])

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setServerError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) {
        setServerError(
          error.message.includes('Invalid')
            ? 'That password does not match your account.'
            : 'Something went wrong. Please try again.'
        )
        return
      }
      const dest = await getDestination(data.email)
      window.location.href = dest
    } catch {
      setServerError('Something went wrong. Please try again.')
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
      <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:4}}>Welcome back</h2>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:20}}>Sign in to your Amana account.</p>

      {serverError && (
        <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16, lineHeight:1.5}}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div>
            <label style={lbl}>Email address</label>
            <input type="email" style={field} placeholder="john@example.com" {...register('email')} />
            {errors.email && <p style={errStyle}>{errors.email.message}</p>}
          </div>
          <div>
            <label style={lbl}>Password</label>
            <div style={{position:'relative'}}>
              <input type={showPwd ? 'text' : 'password'} style={{...field, paddingRight:40}} placeholder="Your password" {...register('password')} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{position:'absolute', right:10, top:11, background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:16}}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p style={errStyle}>{errors.password.message}</p>}
          </div>
          <div style={{textAlign:'right', marginTop:-6}}>
            <Link href="/forgot-password" style={{fontSize:12, color:'#7C3AED', textDecoration:'none'}}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={isLoading}
            style={{width:'100%', height:48, background:'#7C3AED', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity:isLoading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4}}>
            {isLoading && <span style={{width:16, height:16, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
            Sign In
          </button>
        </div>
      </form>
      <p style={{textAlign:'center', fontSize:13, color:'#6B7280', marginTop:16}}>
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" style={{color:'#7C3AED', fontWeight:500, textDecoration:'none'}}>Create one</Link>
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
