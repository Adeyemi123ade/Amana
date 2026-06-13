'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { businessInfoSchema, type BusinessInfoFormData } from '@/lib/validations/auth'
import { generateSlug } from '@/lib/utils'

const BUSINESS_TYPES = ['Photography','Consulting','Freelance Design','Hair & Beauty','Fashion','Coaching & Training','Real Estate','Food & Catering','Events & Planning','Healthcare','Legal Services','Technology','Education','Other']
const CURRENCIES = [{code:'NGN',label:'Nigerian Naira (₦)'},{code:'USD',label:'US Dollar ($)'},{code:'GBP',label:'British Pound (£)'},{code:'EUR',label:'Euro (€)'},{code:'GHS',label:'Ghanaian Cedi (GH₵)'},{code:'KES',label:'Kenyan Shilling (KSh)'},{code:'ZAR',label:'South African Rand (R)'}]
const BUSINESS_SIZES = ['Just me (solo)','2-5 people','6-10 people','11-25 people','25+ people']
const COUNTRIES = ['Nigeria','Ghana','Kenya','South Africa','United Kingdom','United States','Canada','Australia','Other']

const field: React.CSSProperties = {width:'100%',height:44,padding:'0 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:14,color:'#111827',outline:'none',boxSizing:'border-box',background:'white'}
const lbl: React.CSSProperties = {display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6}
const err: React.CSSProperties = {fontSize:11,color:'#EF4444',marginTop:4}

export default function BusinessInformationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: { country: 'Nigeria', currency: 'NGN' },
  })

  const onSubmit = async (data: BusinessInfoFormData) => {
    setIsLoading(true)
    setServerError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const slug = `${generateSlug(data.businessName)}-${Math.random().toString(36).slice(2,6)}`
      const { error } = await supabase.from('workspaces').insert({
        name: data.businessName,
        slug,
        business_type: data.businessType,
        business_email: data.businessEmail || null,
        business_address: data.businessAddress,
        country: data.country,
        currency: data.currency,
        business_size: data.businessSize,
        website: data.website || null,
        instagram: data.instagram || null,
        whatsapp_number: data.whatsappNumber || null,
        created_by: user.id,
      })
      if (error) throw new Error(error.message)
      await supabase.auth.updateUser({ data: { onboarding_complete: true } })
      router.push('/onboarding/theme')
    } catch (e: any) {
      setServerError(e.message || 'We could not save your business details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#F5F5F5',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 16px'}}>
      <div style={{width:'100%',maxWidth:520,background:'white',borderRadius:20,padding:'36px 32px',boxShadow:'0 2px 16px rgba(0,0,0,0.08)'}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:24}}>
          <div style={{width:32,height:32,background:'#7C3AED',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{fontWeight:700,fontSize:16,color:'#111827'}}>Amana</span>
        </div>

        <h2 style={{fontSize:20,fontWeight:700,color:'#111827',marginBottom:4}}>Business Information</h2>
        <p style={{fontSize:13,color:'#6B7280',marginBottom:24}}>Tell us about your business to complete setup.</p>

        {serverError && <div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#DC2626',marginBottom:16}}>{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label style={lbl}>Business name</label>
              <input style={field} placeholder="John's Photography" {...register('businessName')} />
              {errors.businessName && <p style={err}>{errors.businessName.message}</p>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label style={lbl}>Business type</label>
                <select {...register('businessType')} style={field}>
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.businessType && <p style={err}>{errors.businessType.message}</p>}
              </div>
              <div>
                <label style={lbl}>Business size</label>
                <select {...register('businessSize')} style={field}>
                  <option value="">Select size</option>
                  {BUSINESS_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.businessSize && <p style={err}>{errors.businessSize.message}</p>}
              </div>
            </div>
            <div>
              <label style={lbl}>Business email <span style={{color:'#9CA3AF',fontWeight:400}}>(optional)</span></label>
              <input type="email" style={field} placeholder="business@example.com" {...register('businessEmail')} />
            </div>
            <div>
              <label style={lbl}>Business address</label>
              <input style={field} placeholder="Lagos, Nigeria" {...register('businessAddress')} />
              {errors.businessAddress && <p style={err}>{errors.businessAddress.message}</p>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label style={lbl}>Country</label>
                <select {...register('country')} style={field}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Currency</label>
                <select {...register('currency')} style={field}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Website <span style={{color:'#9CA3AF',fontWeight:400}}>(optional)</span></label>
              <input type="url" style={field} placeholder="https://yourwebsite.com" {...register('website')} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label style={lbl}>Instagram <span style={{color:'#9CA3AF',fontWeight:400}}>(optional)</span></label>
                <input style={field} placeholder="@yourhandle" {...register('instagram')} />
              </div>
              <div>
                <label style={lbl}>WhatsApp <span style={{color:'#9CA3AF',fontWeight:400}}>(optional)</span></label>
                <input style={field} placeholder="+234 812 345 6789" {...register('whatsappNumber')} />
              </div>
            </div>
            <button type="submit" disabled={isLoading} style={{width:'100%',height:48,background:'#7C3AED',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:600,cursor:'pointer',opacity:isLoading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:4}}>
              {isLoading && <span style={{width:16,height:16,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>}
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
