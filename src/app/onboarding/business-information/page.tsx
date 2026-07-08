'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COUNTRIES } from '@/lib/utils/countries'
import { BUSINESS_TYPES, BUSINESS_TITLES, CURRENCIES, COUNTRY_CURRENCY_MAP, COUNTRY_BANKS, COUNTRY_STATES, STATE_CITIES } from '@/lib/utils/onboarding-data'
import { generateSlug } from '@/lib/utils'

// Client created ONCE outside component
const supabase = createClient()

const f: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white' }
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }
const err: React.CSSProperties = { fontSize:11, color:'#EF4444', marginTop:4 }

function formatWhatsApp(raw: string, dialCode: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const dial = dialCode.replace('+', '')
  if (digits.startsWith('0') && digits.length > 6) return '+' + dial + digits.slice(1)
  if (!digits.startsWith(dial)) return '+' + dial + digits
  return '+' + digits
}

type Step = 'business' | 'location' | 'online' | 'banking'

const ONBOARD_DRAFT_KEY = 'amana_onboarding_draft'

export default function BusinessInformationPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('business')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [customTitle, setCustomTitle] = useState('')
  const [userCountryCode, setUserCountryCode] = useState('NG')
  const [userId, setUserId] = useState('')

  // Load user country from registration, and restore any in-progress draft
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Restore draft progress for this exact user, if any (survives refresh/back button)
      let restoredCountryCode: string | null = null
      try {
        const raw = sessionStorage.getItem(ONBOARD_DRAFT_KEY)
        if (raw) {
          const draft = JSON.parse(raw)
          if (draft.userId === user.id) {
            if (draft.step) setStep(draft.step)
            if (draft.biz) setBiz(draft.biz)
            if (draft.loc) { setLoc(draft.loc); restoredCountryCode = draft.loc.countryCode }
            if (draft.online) setOnline(draft.online)
            if (draft.bank) setBank(draft.bank)
            if (draft.customTitle) setCustomTitle(draft.customTitle)
          } else {
            sessionStorage.removeItem(ONBOARD_DRAFT_KEY)
          }
        }
      } catch {}

      if (user.user_metadata?.country && !restoredCountryCode) {
        const country = COUNTRIES.find(c => c.code === user.user_metadata.country || c.name === user.user_metadata.country)
        if (country) setUserCountryCode(country.code)
      }
      // If workspace already exists, go to dashboard
      const { data: ws } = await supabase.from('workspaces').select('id').eq('created_by', user.id).maybeSingle()
      if (ws) { router.replace('/dashboard'); return }
    }
    load()
  }, [])

  const [biz, setBiz] = useState({
    name: '', regNumber: '', type: '', title: '', size: 'Just me (solo)',
  })
  const [loc, setLoc] = useState({
    countryCode: userCountryCode, state: '', city: '', address: '', currency: 'NGN',
  })
  const [online, setOnline] = useState({
    website: '', whatsapp: '', linkedin: '', instagram: '',
  })
  const [bank, setBank] = useState({
    bankCountry: '', bankName: '', accountNumber: '', accountName: '',
  })

  // Sync loc countryCode when userCountryCode loads
  useEffect(() => {
    setLoc(l => ({ ...l, countryCode: userCountryCode }))
    setBank(b => ({ ...b, bankCountry: userCountryCode }))
    const curr = COUNTRY_CURRENCY_MAP[userCountryCode] || 'USD'
    setLoc(l => ({ ...l, currency: curr }))
  }, [userCountryCode])

  // Persist progress so a refresh or back-button navigation doesn't lose completed steps
  useEffect(() => {
    if (!userId) return
    try {
      sessionStorage.setItem(ONBOARD_DRAFT_KEY, JSON.stringify({ userId, step, biz, loc, online, bank, customTitle }))
    } catch {}
  }, [userId, step, biz, loc, online, bank, customTitle])

  const selectedCountry = COUNTRIES.find(c => c.code === loc.countryCode) || COUNTRIES[0]
  const states = COUNTRY_STATES[loc.countryCode] || COUNTRY_STATES['DEFAULT'] || []
  const banks = COUNTRY_BANKS[bank.bankCountry] || COUNTRY_BANKS['DEFAULT']

  const handleCountryChange = (code: string) => {
    const curr = COUNTRY_CURRENCY_MAP[code] || 'USD'
    setLoc(l => ({ ...l, countryCode: code, state: '', city: '', currency: curr }))
  }

  const validateStep = (s: Step) => {
    const e: Record<string,string> = {}
    if (s === 'business') {
      if (!biz.name.trim()) e.name = 'Business name is required'
      if (!biz.type) e.type = 'Please select a business type'
      if (!biz.title) e.title = 'Please select your business title or category'
      if (biz.title === 'Other' && !customTitle.trim()) e.customTitle = 'Please enter your business title'
    }
    if (s === 'location') {
      if (!loc.address.trim()) e.address = 'Business address is required'
    }
    if (s === 'banking') {
      if (!bank.accountNumber.trim()) e.accountNumber = 'Account number is required'
      if (!bank.accountName.trim()) e.accountName = 'Account name is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (step === 'business' && validateStep('business')) setStep('location')
    else if (step === 'location' && validateStep('location')) setStep('online')
    else if (step === 'online') setStep('banking')
  }
  const prevStep = () => {
    if (step === 'location') setStep('business')
    else if (step === 'online') setStep('location')
    else if (step === 'banking') setStep('online')
  }

  const STEPS: Step[] = ['business', 'location', 'online', 'banking']
  const stepIdx = STEPS.indexOf(step)
  const stepLabels = ['Business', 'Location', 'Online', 'Banking']

  const handleDone = async () => {
    if (!validateStep('banking')) return
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Step 1: Get authenticated user
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) throw new Error('You are not signed in. Please sign in and try again.')

      // Step 2: Check for existing workspace (prevent duplicates)
      const { data: existing } = await supabase
        .from('workspaces').select('id').eq('created_by', user.id).maybeSingle()
      if (existing) {
        try { sessionStorage.removeItem(ONBOARD_DRAFT_KEY) } catch {}
        await supabase.auth.updateUser({ data: { onboarding_complete: true } })
        router.push('/onboarding/theme')
        return
      }

      // Step 3: Build workspace data
      const country = COUNTRIES.find(c => c.code === loc.countryCode)
      const whatsapp = online.whatsapp ? formatWhatsApp(online.whatsapp, country?.dial || '+1') : null
      const finalTitle = biz.title === 'Other' ? customTitle.trim() : biz.title
      const slug = `${generateSlug(biz.name)}-${Math.random().toString(36).slice(2,6)}`

      // Step 4: Insert workspace
      const { data: ws, error: wsErr } = await supabase.from('workspaces').insert({
        name: biz.name.trim(),
        slug,
        business_type: biz.type,
        business_title: finalTitle,
        business_reg_number: biz.regNumber.trim() || null,
        business_address: loc.address.trim(),
        state: loc.state || null,
        city: loc.city.trim() || null,
        country: country?.name || loc.countryCode,
        currency: loc.currency,
        business_size: biz.size,
        website: online.website.trim() || null,
        whatsapp_number: whatsapp,
        linkedin: online.linkedin.trim() || null,
        instagram: online.instagram.trim() || null,
        bank_name: bank.bankName || null,
        bank_country: COUNTRIES.find(c => c.code === bank.bankCountry)?.name || bank.bankCountry || null,
        account_number: bank.accountNumber.trim() || null,
        account_name: bank.accountName.trim() || null,
        created_by: user.id,
        onboarding_complete: true,
      }).select('id').single()

      if (wsErr) throw new Error(`We could not create your workspace. ${wsErr.code === '23505' ? 'A workspace already exists for this account.' : 'Please try again.'}`)

      // Step 5: Verify workspace was actually created
      const { data: verify } = await supabase
        .from('workspaces').select('id').eq('id', ws.id).single()
      if (!verify) throw new Error('Workspace was created but could not be verified. Please try again.')

      // Step 6: Mark onboarding complete in user metadata
      await supabase.auth.updateUser({ data: { onboarding_complete: true } })

      // Step 7: Clear saved draft and redirect to theme selection
      try { sessionStorage.removeItem(ONBOARD_DRAFT_KEY) } catch {}
      router.push('/onboarding/theme')

    } catch (e: any) {
      setSubmitError(e.message || 'Something went wrong. Please try again.')
      setRetryCount(r => r + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ background:'white', borderRadius:14, border:'1px solid #E5E7EB', padding:'20px', marginBottom:16 }}>
      <p style={{ fontSize:12, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.5, marginBottom:14 }}>{title}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>{children}</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#F5F5F5', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <div style={{ width:'100%', maxWidth:600 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
          <div style={{ width:32, height:32, background:'#7C3AED', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{ fontWeight:800, fontSize:17, color:'#111827' }}>Amana</span>
        </div>

        {/* Progress steps */}
        <div style={{ display:'flex', gap:0, marginBottom:24, background:'white', borderRadius:12, padding:'12px 16px', border:'1px solid #E5E7EB' }}>
          {stepLabels.map((label, i) => (
            <div key={label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{
                width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                background: i < stepIdx ? '#22C55E' : i === stepIdx ? '#7C3AED' : '#F3F4F6',
                fontSize:11, fontWeight:700,
                color: i <= stepIdx ? 'white' : '#9CA3AF',
              }}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <span style={{ fontSize:10, fontWeight:500, color: i === stepIdx ? '#7C3AED' : i < stepIdx ? '#22C55E' : '#9CA3AF' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ background:'white', borderRadius:20, padding:'28px 28px', boxShadow:'0 2px 16px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', marginBottom:4 }}>
            {step === 'business' && 'Business Details'}
            {step === 'location' && 'Business Location'}
            {step === 'online' && 'Online Presence'}
            {step === 'banking' && 'Banking Information'}
          </h2>
          <p style={{ fontSize:13, color:'#6B7280', marginBottom:20 }}>
            {step === 'business' && 'Tell us about your business'}
            {step === 'location' && 'Where is your business located?'}
            {step === 'online' && 'How can customers find you online? (optional)'}
            {step === 'banking' && 'Where should customers transfer payments?'}
          </p>

          {/* ── STEP 1: BUSINESS ── */}
          {step === 'business' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={lbl}>Business Name <span style={{color:'#EF4444'}}>*</span></label>
                <input style={f} placeholder="e.g. John's Photography" value={biz.name} onChange={e => setBiz({...biz, name:e.target.value})} />
                {errors.name && <p style={err}>{errors.name}</p>}
              </div>
              <div>
                <label style={lbl}>Business Registration Number <span style={{color:'#9CA3AF', fontWeight:400}}>(optional)</span></label>
                <input style={f} placeholder="e.g. RC1234567" value={biz.regNumber} onChange={e => setBiz({...biz, regNumber:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Business Type <span style={{color:'#EF4444'}}>*</span></label>
                <select value={biz.type} onChange={e => setBiz({...biz, type:e.target.value})} style={f}>
                  <option value="">Select business type...</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p style={err}>{errors.type}</p>}
              </div>
              <div>
                <label style={lbl}>Your Role / Business Title <span style={{color:'#EF4444'}}>*</span></label>
                <select value={biz.title} onChange={e => setBiz({...biz, title:e.target.value})} style={f}>
                  <option value="">Select your role or profession...</option>
                  {BUSINESS_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.title && <p style={err}>{errors.title}</p>}
              </div>
              {biz.title === 'Other' && (
                <div>
                  <label style={lbl}>Enter your business title <span style={{color:'#EF4444'}}>*</span></label>
                  <input style={f} placeholder="e.g. Blockchain Developer" value={customTitle} onChange={e => setCustomTitle(e.target.value)} />
                  {errors.customTitle && <p style={err}>{errors.customTitle}</p>}
                </div>
              )}
              <div>
                <label style={lbl}>Business Size</label>
                <select value={biz.size} onChange={e => setBiz({...biz, size:e.target.value})} style={f}>
                  {['Just me (solo)','2-5 people','6-10 people','11-25 people','25+ people'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 2: LOCATION ── */}
          {step === 'location' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Country only — currency is auto-locked */}
              <div>
                <label style={lbl}>Country</label>
                <select value={loc.countryCode} onChange={e => handleCountryChange(e.target.value)} style={f}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>State / Province</label>
                {states.length > 0 ? (
                  <select value={loc.state} onChange={e => setLoc({...loc, state:e.target.value, city:''})} style={f}>
                    <option value="">Select state or province...</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input style={f} placeholder="Enter your state or province" value={loc.state} onChange={e => setLoc({...loc, state:e.target.value})} />
                )}
              </div>
              <div>
                <label style={lbl}>City</label>
                {STATE_CITIES[loc.state] && STATE_CITIES[loc.state].length > 0 ? (
                  <>
                    <select value={loc.city} onChange={e => setLoc({...loc, city:e.target.value})} style={f}>
                      <option value="">Select city...</option>
                      {STATE_CITIES[loc.state].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {loc.city === 'Other' && (
                      <input style={{...f, marginTop:8}} placeholder="Enter your city name" onChange={e => setLoc({...loc, city:e.target.value})} />
                    )}
                  </>
                ) : (
                  <input style={f} placeholder="Enter your city" value={loc.city} onChange={e => setLoc({...loc, city:e.target.value})} />
                )}
              </div>
              <div>
                <label style={lbl}>Full Business Address <span style={{color:'#EF4444'}}>*</span></label>
                <input style={f} placeholder="Street address, area, city" value={loc.address} onChange={e => setLoc({...loc, address:e.target.value})} />
                {errors.address && <p style={err}>{errors.address}</p>}
              </div>
            </div>
          )}

          {/* ── STEP 3: ONLINE ── */}
          {step === 'online' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={lbl}>Website</label>
                <input type="url" style={f} placeholder="https://yoursite.com" value={online.website} onChange={e => setOnline({...online, website:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>WhatsApp Number</label>
                <div style={{position:'relative'}}>
                  <div style={{position:'absolute', left:10, top:13, fontSize:12, color:'#6B7280', pointerEvents:'none', fontWeight:500}}>
                    {selectedCountry.dial}
                  </div>
                  <input
                    style={{...f, paddingLeft: selectedCountry.dial.length * 8 + 16}}
                    placeholder={loc.countryCode === 'NG' ? '8012345678' : 'Phone number'}
                    value={online.whatsapp}
                    onChange={e => setOnline({...online, whatsapp:e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label style={lbl}>LinkedIn</label>
                <input style={f} placeholder="https://linkedin.com/in/yourprofile" value={online.linkedin} onChange={e => setOnline({...online, linkedin:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Instagram</label>
                <input style={f} placeholder="@yourhandle" value={online.instagram} onChange={e => setOnline({...online, instagram:e.target.value})} />
              </div>
              <div style={{background:'#F9FAFB', borderRadius:8, padding:12}}>
                <p style={{fontSize:12, color:'#9CA3AF'}}>All fields on this step are optional. You can add or update them later in Settings.</p>
              </div>
            </div>
          )}

          {/* ── STEP 4: BANKING ── */}
          {step === 'banking' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{background:'#F5F3FF', borderRadius:10, padding:'12px 14px', border:'1px solid #DDD6FE'}}>
                <p style={{fontSize:12, color:'#7C3AED', fontWeight:500}}>
                  These details appear on your invoice payment page when customers choose bank transfer.
                </p>
              </div>
              <div>
                <label style={lbl}>Bank Country</label>
                <select value={bank.bankCountry || loc.countryCode} onChange={e => setBank({...bank, bankCountry:e.target.value, bankName:''})} style={f}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Bank Name</label>
                <select value={bank.bankName} onChange={e => setBank({...bank, bankName:e.target.value})} style={f}>
                  <option value="">Select your bank...</option>
                  {(COUNTRY_BANKS[bank.bankCountry || loc.countryCode] || COUNTRY_BANKS['DEFAULT']).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="Other">Other (not listed)</option>
                </select>
              </div>
              {bank.bankName === 'Other' && (
                <div>
                  <label style={lbl}>Enter Bank Name</label>
                  <input style={f} placeholder="Your bank name" value={bank.bankName === 'Other' ? '' : bank.bankName} onChange={e => setBank({...bank, bankName:e.target.value})} />
                </div>
              )}
              <div>
                <label style={lbl}>Account Number <span style={{color:'#EF4444'}}>*</span></label>
                <input style={f} placeholder="0123456789" value={bank.accountNumber} onChange={e => setBank({...bank, accountNumber:e.target.value.replace(/\D/g,'')})} maxLength={20} />
                {errors.accountNumber && <p style={err}>{errors.accountNumber}</p>}
              </div>
              <div>
                <label style={lbl}>Account Name <span style={{color:'#EF4444'}}>*</span></label>
                <input style={f} placeholder="Name on your bank account" value={bank.accountName} onChange={e => setBank({...bank, accountName:e.target.value})} />
                {errors.accountName && <p style={err}>{errors.accountName}</p>}
              </div>
            </div>
          )}

          {/* Error + retry */}
          {submitError && (
            <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'12px 14px', marginTop:16}}>
              <p style={{fontSize:13, color:'#DC2626', marginBottom:8}}>{submitError}</p>
              {retryCount > 0 && (
                <button onClick={handleDone} style={{fontSize:13, color:'#7C3AED', background:'none', border:'none', cursor:'pointer', fontWeight:600, textDecoration:'underline', padding:0}}>
                  Try again
                </button>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            {step !== 'business' && (
              <button onClick={prevStep} style={{ flex:1, height:48, background:'white', border:'1px solid #E5E7EB', borderRadius:12, fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer' }}>
                Back
              </button>
            )}
            {step !== 'banking' ? (
              <button onClick={nextStep} style={{ flex:2, height:48, background:'#7C3AED', border:'none', borderRadius:12, fontSize:14, fontWeight:600, color:'white', cursor:'pointer' }}>
                Continue →
              </button>
            ) : (
              <button
                onClick={handleDone}
                disabled={isSubmitting}
                style={{ flex:2, height:48, background:'#7C3AED', border:'none', borderRadius:12, fontSize:14, fontWeight:600, color:'white', cursor:isSubmitting?'not-allowed':'pointer', opacity:isSubmitting?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              >
                {isSubmitting && <span style={{width:16, height:16, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
                {isSubmitting ? 'Setting up your workspace...' : 'Done — Go to Dashboard'}
              </button>
            )}
          </div>

          {isSubmitting && (
            <div style={{marginTop:12, padding:'10px 14px', background:'#F5F3FF', borderRadius:8, border:'1px solid #DDD6FE'}}>
              <p style={{fontSize:12, color:'#7C3AED', textAlign:'center'}}>Setting up your workspace. Please do not close this page...</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
