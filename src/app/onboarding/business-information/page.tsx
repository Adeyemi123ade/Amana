'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES } from '@/lib/utils/countries'
import { generateSlug } from '@/lib/utils'

const BUSINESS_TYPES = [
  'Photography','Videography','Consulting','Freelance Design','Hair & Beauty',
  'Fashion & Clothing','Coaching & Training','Real Estate','Food & Catering',
  'Events & Planning','Healthcare','Legal Services','Technology','Education',
  'Retail','Transportation','Construction','Agriculture','Media & PR','Other',
]

const BUSINESS_SIZES = [
  'Just me (solo)','2-5 people','6-10 people','11-25 people','25+ people',
]

const CURRENCIES = [
  {code:'NGN', label:'Nigerian Naira (₦)'},
  {code:'USD', label:'US Dollar ($)'},
  {code:'GBP', label:'British Pound (£)'},
  {code:'EUR', label:'Euro (€)'},
  {code:'GHS', label:'Ghanaian Cedi (GH₵)'},
  {code:'KES', label:'Kenyan Shilling (KSh)'},
  {code:'ZAR', label:'South African Rand (R)'},
  {code:'AED', label:'UAE Dirham (AED)'},
  {code:'SAR', label:'Saudi Riyal (SAR)'},
  {code:'CAD', label:'Canadian Dollar (CA$)'},
  {code:'AUD', label:'Australian Dollar (A$)'},
  {code:'INR', label:'Indian Rupee (₹)'},
  {code:'BRL', label:'Brazilian Real (R$)'},
  {code:'ZMW', label:'Zambian Kwacha (ZMW)'},
  {code:'TZS', label:'Tanzanian Shilling (TZS)'},
  {code:'UGX', label:'Ugandan Shilling (UGX)'},
  {code:'ETB', label:'Ethiopian Birr (ETB)'},
  {code:'XOF', label:'West African CFA Franc (XOF)'},
  {code:'MAD', label:'Moroccan Dirham (MAD)'},
  {code:'EGP', label:'Egyptian Pound (EGP)'},
]

const field: React.CSSProperties = {
  width:'100%', height:44, padding:'0 12px', borderRadius:8,
  border:'1px solid #E5E7EB', fontSize:14, color:'#111827',
  outline:'none', boxSizing:'border-box', background:'white',
}
const lbl: React.CSSProperties = {
  display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6,
}
const err: React.CSSProperties = { fontSize:11, color:'#EF4444', marginTop:4 }

// Smart WhatsApp number formatter
// Detects country code and formats accordingly
function formatWhatsApp(raw: string, dialCode: string): string {
  // Strip all non-digits
  let digits = raw.replace(/\D/g, '')
  if (!digits) return ''

  // If number already starts with country code digits (without +), keep as is
  // If it starts with 0 (local format like 08012345678), replace leading 0 with country code
  const dialDigits = dialCode.replace('+', '')

  if (digits.startsWith('0') && digits.length > 6) {
    // Local format — replace leading 0 with country dial code
    digits = dialDigits + digits.slice(1)
  } else if (!digits.startsWith(dialDigits)) {
    // No leading 0 and no country code — prepend country code
    digits = dialDigits + digits
  }

  return '+' + digits
}

export default function BusinessInformationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === 'NG') || COUNTRIES[0])
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    businessEmail: '',
    businessAddress: '',
    website: '',
    businessSize: '',
    currency: 'NGN',
    whatsappRaw: '',
    instagram: '',
  })
  const [errors, setErrors] = useState<Record<string,string>>({})

  const validate = () => {
    const e: Record<string,string> = {}
    if (!form.businessName.trim()) e.businessName = 'Business name is required'
    if (!form.businessType) e.businessType = 'Please select a business type'
    if (!form.businessAddress.trim()) e.businessAddress = 'Business address is required'
    if (!form.businessSize) e.businessSize = 'Please select your business size'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code) || COUNTRIES[0]
    setSelectedCountry(country)
    // Auto-set currency for common countries
    const currencyMap: Record<string,string> = {
      NG:'NGN', US:'USD', GB:'GBP', GH:'GHS', KE:'KES', ZA:'ZAR',
      AE:'AED', SA:'SAR', CA:'CAD', AU:'AUD', IN:'INR', BR:'BRL',
      ZM:'ZMW', TZ:'TZS', UG:'UGX', ET:'ETB', EG:'EGP',
    }
    if (currencyMap[code]) setForm(f => ({...f, currency: currencyMap[code]}))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setServerError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if workspace already exists — do not create duplicate
      const { data: existing } = await supabase
        .from('workspaces').select('id').eq('created_by', user.id).maybeSingle()

      if (existing) {
        // Already has workspace — go to dashboard
        router.push('/dashboard')
        return
      }

      const slug = `${generateSlug(form.businessName)}-${Math.random().toString(36).slice(2,6)}`
      const whatsapp = form.whatsappRaw
        ? formatWhatsApp(form.whatsappRaw, selectedCountry.dial)
        : null

      const { error } = await supabase.from('workspaces').insert({
        name: form.businessName.trim(),
        slug,
        business_type: form.businessType,
        business_email: form.businessEmail.trim() || null,
        business_address: form.businessAddress.trim(),
        country: selectedCountry.name,
        currency: form.currency,
        business_size: form.businessSize,
        website: form.website.trim() || null,
        instagram: form.instagram.trim() || null,
        whatsapp_number: whatsapp,
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

  const whatsappPreview = form.whatsappRaw
    ? formatWhatsApp(form.whatsappRaw, selectedCountry.dial)
    : ''

  return (
    <div style={{minHeight:'100vh', background:'#F5F5F5', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      <div style={{width:'100%', maxWidth:560, background:'white', borderRadius:20, padding:'36px 32px', boxShadow:'0 2px 16px rgba(0,0,0,0.08)'}}>

        {/* Logo */}
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:24}}>
          <div style={{width:32, height:32, background:'#7C3AED', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{fontWeight:800, fontSize:17, color:'#111827'}}>Amana</span>
        </div>

        <h2 style={{fontSize:20, fontWeight:700, color:'#111827', marginBottom:4}}>Business Information</h2>
        <p style={{fontSize:13, color:'#6B7280', marginBottom:24}}>Tell us about your business. This only appears once.</p>

        {serverError && (
          <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16}}>
            {serverError}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={{display:'flex', flexDirection:'column', gap:16}}>

            {/* Business name */}
            <div>
              <label style={lbl}>Business Name <span style={{color:'#EF4444'}}>*</span></label>
              <input style={field} placeholder="e.g. John's Photography" value={form.businessName} onChange={e => setForm({...form, businessName:e.target.value})} />
              {errors.businessName && <p style={err}>{errors.businessName}</p>}
            </div>

            {/* Business type + size */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div>
                <label style={lbl}>Business Type <span style={{color:'#EF4444'}}>*</span></label>
                <select value={form.businessType} onChange={e => setForm({...form, businessType:e.target.value})} style={field}>
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.businessType && <p style={err}>{errors.businessType}</p>}
              </div>
              <div>
                <label style={lbl}>Business Size <span style={{color:'#EF4444'}}>*</span></label>
                <select value={form.businessSize} onChange={e => setForm({...form, businessSize:e.target.value})} style={field}>
                  <option value="">Select size</option>
                  {BUSINESS_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.businessSize && <p style={err}>{errors.businessSize}</p>}
              </div>
            </div>

            {/* Country + Currency */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div>
                <label style={lbl}>Country</label>
                <select value={selectedCountry.code} onChange={e => handleCountryChange(e.target.value)} style={field}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Currency</label>
                <select value={form.currency} onChange={e => setForm({...form, currency:e.target.value})} style={field}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Business email */}
            <div>
              <label style={lbl}>Business Email <span style={{color:'#9CA3AF', fontWeight:400}}>(optional)</span></label>
              <input type="email" style={field} placeholder="business@example.com" value={form.businessEmail} onChange={e => setForm({...form, businessEmail:e.target.value})} />
            </div>

            {/* Business address */}
            <div>
              <label style={lbl}>Business Address <span style={{color:'#EF4444'}}>*</span></label>
              <input style={field} placeholder="e.g. Lagos, Nigeria" value={form.businessAddress} onChange={e => setForm({...form, businessAddress:e.target.value})} />
              {errors.businessAddress && <p style={err}>{errors.businessAddress}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <label style={lbl}>
                WhatsApp Number <span style={{color:'#9CA3AF', fontWeight:400}}>(optional)</span>
              </label>
              <div style={{position:'relative'}}>
                <div style={{position:'absolute', left:10, top:13, fontSize:12, color:'#6B7280', pointerEvents:'none', fontWeight:500}}>
                  {selectedCountry.dial}
                </div>
                <input
                  style={{...field, paddingLeft: selectedCountry.dial.length * 8 + 16}}
                  placeholder={selectedCountry.code === 'NG' ? '8012345678 or 08012345678' : selectedCountry.code === 'AE' ? '501234567 or 0501234567' : 'Phone number'}
                  value={form.whatsappRaw}
                  onChange={e => setForm({...form, whatsappRaw:e.target.value})}
                />
              </div>
              {whatsappPreview && (
                <p style={{fontSize:11, color:'#22C55E', marginTop:4}}>
                  ✓ Will be saved as: <strong>{whatsappPreview}</strong>
                </p>
              )}
              <p style={{fontSize:11, color:'#9CA3AF', marginTop:3}}>
                Enter your number with or without the country code — we will format it automatically
              </p>
            </div>

            {/* Website + Instagram */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div>
                <label style={lbl}>Website <span style={{color:'#9CA3AF', fontWeight:400}}>(optional)</span></label>
                <input type="url" style={field} placeholder="https://yoursite.com" value={form.website} onChange={e => setForm({...form, website:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Instagram <span style={{color:'#9CA3AF', fontWeight:400}}>(optional)</span></label>
                <input style={field} placeholder="@yourhandle" value={form.instagram} onChange={e => setForm({...form, instagram:e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              style={{width:'100%', height:48, background:'#7C3AED', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', opacity:isLoading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4}}>
              {isLoading && <span style={{width:16, height:16, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
              Continue
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
