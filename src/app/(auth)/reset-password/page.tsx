'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'
import { validatePassword } from '@/lib/utils'

const field: React.CSSProperties = {width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white'}

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [pwdValue, setPwdValue] = useState('')
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState:{errors} } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) })

  const strength = validatePassword(pwdValue)
  const strengthColor = strength === 'Strong' ? '#22C55E' : strength === 'Medium' ? '#F59E0B' : '#EF4444'

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true); setServerError('')
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) { setServerError('We could not complete that action right now.'); return }
      router.push('/sign-in')
    } catch { setServerError('Something went wrong.') }
    finally { setIsLoading(false) }
  }

  return (
    <div>
      <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:4}}>Create new password</h2>
      <p style={{fontSize:13, color:'#6B7280', marginBottom:20}}>Enter your new password below.</p>
      {serverError && <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16}}>{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div>
            <label style={{display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}}>New password</label>
            <div style={{position:'relative'}}>
              <input type={showPwd ? 'text' : 'password'} style={{...field, paddingRight:40}} placeholder="••••••••" {...register('password')} onChange={e => setPwdValue(e.target.value)} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{position:'absolute', right:10, top:11, background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:16}}>{showPwd ? '🙈' : '👁'}</button>
            </div>
            {pwdValue && (
              <div style={{marginTop:6}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
                  <span style={{fontSize:11, color:'#6B7280'}}>Password strength</span>
                  <span style={{fontSize:11, color:strengthColor, fontWeight:600}}>{strength}</span>
                </div>
                <div style={{height:4, background:'#F3F4F6', borderRadius:4}}>
                  <div style={{height:4, borderRadius:4, background:strengthColor, width: strength==='Strong'?'100%':strength==='Medium'?'66%':'33%'}} />
                </div>
              </div>
            )}
            {errors.password && <p style={{fontSize:11, color:'#EF4444', marginTop:4}}>{errors.password.message}</p>}
          </div>
          <div>
            <label style={{display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6}}>Confirm new password</label>
            <div style={{position:'relative'}}>
              <input type={showCfm ? 'text' : 'password'} style={{...field, paddingRight:40}} placeholder="••••••••" {...register('confirmPassword')} />
              <button type="button" onClick={() => setShowCfm(!showCfm)} style={{position:'absolute', right:10, top:11, background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:16}}>{showCfm ? '🙈' : '👁'}</button>
            </div>
            {errors.confirmPassword && <p style={{fontSize:11, color:'#EF4444', marginTop:4}}>{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isLoading} style={{width:'100%', height:48, background:'#7C3AED', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity:isLoading?0.7:1}}>
            Reset Password
          </button>
        </div>
      </form>
      <div style={{textAlign:'center', marginTop:12}}>
        <Link href="/sign-in" style={{fontSize:13, color:'#6B7280', textDecoration:'none'}}>Back to sign in</Link>
      </div>
    </div>
  )
}
