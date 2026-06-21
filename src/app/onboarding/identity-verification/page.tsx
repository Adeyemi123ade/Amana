'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSupabase } from '@/lib/supabase/client'

type DocType = 'NIN' | 'PASSPORT' | 'DRIVER_LICENSE'

const DOC_LABELS: Record<DocType, string> = {
  NIN: 'National Identification Number (NIN)',
  PASSPORT: 'International Passport',
  DRIVER_LICENSE: "Driver's License",
}

const DOC_NUMBER_LABELS: Record<DocType, string> = {
  NIN: 'NIN Number',
  PASSPORT: 'Passport Number',
  DRIVER_LICENSE: "Driver's License Number",
}

const DOC_NUMBER_PLACEHOLDER: Record<DocType, string> = {
  NIN: 'e.g. 12345678901',
  PASSPORT: 'e.g. A12345678',
  DRIVER_LICENSE: 'e.g. ABC123456789',
}

const inp: React.CSSProperties = {
  width: '100%', height: 46, padding: '0 14px', borderRadius: 10,
  border: '1.5px solid #E5E7EB', fontSize: 15, color: '#111827',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

export default function IdentityVerificationPage() {
  const router = useRouter()
  const supabase = createSupabase()

  const [docType, setDocType] = useState<DocType>('NIN')
  const [docNumber, setDocNumber] = useState('')
  const [docNumberError, setDocNumberError] = useState('')
  const [step, setStep] = useState<'number' | 'upload' | 'selfie' | 'done'>('number')

  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState('')
  const [backFile, setBackFile] = useState<File | null>(null)
  const [backPreview, setBackPreview] = useState('')
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Relaxed validation — just requires something is entered
  const validateNumber = () => {
    const val = docNumber.trim()
    if (!val) {
      setDocNumberError('Please enter your ' + DOC_NUMBER_LABELS[docType])
      return false
    }
    setDocNumberError('')
    return true
  }

  const pickFile = (
    setter: (f: File) => void,
    previewSetter: (s: string) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return }
    setter(file)
    previewSetter(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async () => {
    if (!frontFile) { setError('Please upload the front of your document'); return }
    if (!selfieFile) { setError('Please upload a selfie or photo'); return }
    setIsLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const upload = async (file: File, path: string) => {
        const { error } = await supabase.storage.from('kyc-documents').upload(path, file, { upsert: true })
        if (error) throw error
        return supabase.storage.from('kyc-documents').getPublicUrl(path).data.publicUrl
      }

      const ts = Date.now()
      const frontUrl = await upload(frontFile, `${user.id}/front-${ts}`)
      const backUrl = backFile ? await upload(backFile, `${user.id}/back-${ts}`) : null
      const selfieUrl = await upload(selfieFile, `${user.id}/selfie-${ts}`)

      await supabase.from('kyc_submissions').upsert({
        user_id: user.id,
        document_type: docType,
        document_number: docNumber.trim(),
        front_image_url: frontUrl,
        back_image_url: backUrl,
        selfie_url: selfieUrl,
        status: 'PENDING',
        submitted_at: new Date().toISOString(),
      })

      setStep('done')
    } catch {
      setError('Could not upload your documents. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const card: React.CSSProperties = {
    background: 'white', borderRadius: 16, padding: '20px 20px',
    border: '1px solid #F3F4F6', marginBottom: 12,
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 700, color: '#374151',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4,
  }

  if (step === 'done') return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ maxWidth: 460, width: '100%', background: 'white', borderRadius: 20, padding: '40px 28px', boxShadow: '0 2px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Verification Submitted</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.65 }}>
          Your identity documents have been submitted for review. This usually takes 1–2 business days.
        </p>
        <button onClick={() => router.push('/dashboard/settings')}
          style={{ width: '100%', height: 48, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Back to Settings
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui,sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* UAT notice */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🧪</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 2 }}>Testing Mode — This step is optional</p>
            <p style={{ fontSize: 12, color: '#B45309', lineHeight: 1.5 }}>No real ID required. You can use any sample text and upload any image to test this flow.</p>
          </div>
        </div>

        {/* Progress header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <button onClick={() => step === 'number' ? router.push('/dashboard/settings') : setStep(step === 'upload' ? 'number' : 'upload')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
          <div style={{ flex: 1, height: 4, background: '#F3F4F6', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#7C3AED', borderRadius: 2, width: step === 'number' ? '33%' : step === 'upload' ? '66%' : '100%', transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            {step === 'number' ? '1/3' : step === 'upload' ? '2/3' : '3/3'}
          </span>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#DC2626', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* ── STEP 1: Document type + number ── */}
        {step === 'number' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Identity Verification</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Select your document type and enter your ID number.</p>

            <div style={card}>
              <label style={lbl}>Document Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {(['NIN', 'PASSPORT', 'DRIVER_LICENSE'] as DocType[]).map(t => (
                  <button key={t} onClick={() => { setDocType(t); setDocNumber(''); setDocNumberError('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `2px solid ${docType === t ? '#7C3AED' : '#E5E7EB'}`, borderRadius: 10, background: docType === t ? '#F5F3FF' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${docType === t ? '#7C3AED' : '#D1D5DB'}`, background: docType === t ? '#7C3AED' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {docType === t && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{DOC_LABELS[t]}</span>
                  </button>
                ))}
              </div>

              <label style={lbl}>{DOC_NUMBER_LABELS[docType]}</label>
              <input
                style={{ ...inp, borderColor: docNumberError ? '#EF4444' : '#E5E7EB' }}
                placeholder={DOC_NUMBER_PLACEHOLDER[docType]}
                value={docNumber}
                onChange={e => { setDocNumber(e.target.value); setDocNumberError('') }}
                onKeyDown={e => e.key === 'Enter' && validateNumber() && setStep('upload')}
              />
              {docNumberError && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{docNumberError}</p>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => router.push('/dashboard/settings')}
                style={{ flex: 1, height: 48, background: 'none', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => { if (validateNumber()) setStep('upload') }}
                style={{ flex: 2, height: 48, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Document upload ── */}
        {step === 'upload' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Upload Your Document</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Upload a photo of your {DOC_LABELS[docType]}. Any image will work for testing.</p>

            {[
              { label: 'Front of Document *', file: frontFile, preview: frontPreview, setter: (f: File) => setFrontFile(f), previewSetter: (s: string) => setFrontPreview(s), required: true },
              { label: 'Back of Document', file: backFile, preview: backPreview, setter: (f: File) => setBackFile(f), previewSetter: (s: string) => setBackPreview(s), required: false },
            ].map(({ label, file, preview, setter, previewSetter, required }) => (
              <div key={label} style={card}>
                <label style={lbl}>{label}</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${file ? '#22C55E' : '#E5E7EB'}`, borderRadius: 10, padding: 20, cursor: 'pointer', background: file ? '#F0FDF4' : '#F9FAFB', minHeight: 100 }}>
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={pickFile(setter, previewSetter)} />
                  {preview ? (
                    <img src={preview} alt="preview" style={{ maxHeight: 120, borderRadius: 6, objectFit: 'contain' }} />
                  ) : (
                    <>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                      <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8 }}>Tap to upload {required ? '(required)' : '(optional)'}</p>
                      <p style={{ fontSize: 11, color: '#D1D5DB', marginTop: 2 }}>JPG, PNG or PDF · Max 5MB</p>
                    </>
                  )}
                </label>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('number')}
                style={{ flex: 1, height: 48, background: 'none', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={() => { if (!frontFile) { setError('Please upload the front of your document'); return } setError(''); setStep('selfie') }}
                style={{ flex: 2, height: 48, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Selfie upload (no camera required) ── */}
        {step === 'selfie' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Upload a Selfie</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Upload a photo of yourself. Any clear photo works for testing.</p>

            <div style={card}>
              <label style={lbl}>Selfie Photo *</label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${selfieFile ? '#22C55E' : '#E5E7EB'}`, borderRadius: 10, padding: 24, cursor: 'pointer', background: selfieFile ? '#F0FDF4' : '#F9FAFB', minHeight: 140 }}>
                <input type="file" accept="image/*" capture="user" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    if (f.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return }
                    setSelfieFile(f)
                    setSelfiePreview(URL.createObjectURL(f))
                    setError('')
                  }} />
                {selfiePreview ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={selfiePreview} alt="selfie" style={{ maxHeight: 200, borderRadius: 10, objectFit: 'cover', marginBottom: 10 }} />
                    <p style={{ fontSize: 12, color: '#7C3AED', textDecoration: 'underline' }}>Tap to change photo</p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🤳</div>
                    <p style={{ fontSize: 14, color: '#374151', fontWeight: 500, marginBottom: 4 }}>Tap to upload or take a photo</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF' }}>JPG or PNG · Max 5MB</p>
                  </>
                )}
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('upload')}
                style={{ flex: 1, height: 48, background: 'none', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={handleSubmit} disabled={isLoading || !selfieFile}
                style={{ flex: 2, height: 48, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: !selfieFile ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isLoading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Submitting...</>
                  : 'Submit Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
