'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'

const field: React.CSSProperties = {width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white'}
const supabase = createClient()

export default function ForgotPasswordPage() {

  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, getValues, formState:{errors} } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true); setServerError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo: `${window.location.origin}/reset-password` })
      if (error) { setServerError('Something went wrong. Please try again.'); return }
      setSent(true)
    } catch { setServerError('Something went wrong.') }
    finally { setIsLoading(false) }
  }

  if (sent) return (
    <div style={{textAlign:'center'}}>
      <div style={{fontSize:48, marginBottom:16}}>📧</div>
      <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:8}}>Check your inbox</h2>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:24}}>We sent a reset link to <strong>{getValues('email')}</strong></p>
      <Link href="/sign-in" style={{display:'block', width:'100%', height:48, background:'#7C3AED', color:'white', borderRadius:12, fontSize:15, fontWeight:600, textDecoration:'none', lineHeight:'48px', textAlign:'center'}}>Back to sign in</Link>
    </div>
  )

  return (
    <div>
      <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:4}}>Forgot your password?</h2>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:20}}>Enter your email address and we'll send you a link to reset it.</p>
      {serverError && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16}}>{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{marginBottom:14}}>
          <label style={{display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}}>Email address</label>
          <input type="email" style={field} placeholder="john@example.com" {...register('email')} />
          {errors.email && <p style={{fontSize:11, color:'#EF4444', marginTop:4}}>{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isLoading} style={{width:'100%', height:48, background:'#7C3AED', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity:isLoading?0.7:1, marginBottom:12}}>
          Send Reset Link
        </button>
      </form>
      <div style={{textAlign:'center'}}>
        <Link href="/sign-in" style={{fontSize:13, color:'#6B7280', textDecoration:'none'}}>Back to sign in</Link>
      </div>
      <div style={{display:'flex', justifyContent:'center', marginTop:24}}>
        <div style={{width:64, height:64, borderRadius:'50%', background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#7C3AED" strokeWidth="1.5"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
