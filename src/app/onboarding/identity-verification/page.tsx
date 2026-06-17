'use client'

import { useState, useRef } from 'react'
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

const DOC_NUMBER_PATTERN: Record<DocType, RegExp> = {
  NIN: /^\d{11}$/,
  PASSPORT: /^[A-Z]{1,2}\d{6,8}$/i,
  DRIVER_LICENSE: /^[A-Z0-9]{6,20}$/i,
}

const DOC_NUMBER_HINT: Record<DocType, string> = {
  NIN: '11 digits',
  PASSPORT: '1-2 letters followed by 6-8 digits',
  DRIVER_LICENSE: '6-20 alphanumeric characters',
}

const inp: React.CSSProperties = { width: '100%', height: 46, padding: '0 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 15, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }

export default function IdentityVerificationPage() {
  const router = useRouter()
  const supabase = createSupabase()
  const cameraRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [docType, setDocType] = useState<DocType>('NIN')
  const [docNumber, setDocNumber] = useState('')
  const [docNumberError, setDocNumberError] = useState('')
  const [step, setStep] = useState<'number' | 'upload' | 'selfie' | 'done'>('number')

  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState('')
  const [backFile, setBackFile] = useState<File | null>(null)
  const [backPreview, setBackPreview] = useState('')
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null)
  const [selfiePreview, setSelfiePreview] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Step 1: Validate doc number ────────────────────────
  const validateNumber = () => {
    const val = docNumber.trim()
    if (!val) { setDocNumberError('Please enter your ' + DOC_NUMBER_LABELS[docType]); return false }
    if (!DOC_NUMBER_PATTERN[docType].test(val)) {
      setDocNumberError(`Invalid format. ${DOC_NUMBER_HINT[docType]}`)
      return false
    }
    setDocNumberError('')
    return true
  }

  const goToUpload = () => { if (validateNumber()) setStep('upload') }

  // ── File picker ────────────────────────────────────────
  const pickFile = (setter: (f: File) => void, previewSetter: (s: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return }
      setter(file)
      previewSetter(URL.createObjectURL(file))
      setError('')
    }

  // ── Camera ─────────────────────────────────────────────
  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      setCameraStream(stream)
      setCameraActive(true)
      setTimeout(() => {
        if (cameraRef.current) {
          cameraRef.current.srcObject = stream
          cameraRef.current.play()
        }
      }, 100)
    } catch {
      setError('Could not access camera. Please allow camera permission and try again, or upload a selfie photo instead.')
    }
  }

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setCameraActive(false)
  }

  const captureSelfie = () => {
    if (!cameraRef.current || !canvasRef.current) return
    const video = cameraRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (blob) {
        setSelfieBlob(blob)
        setSelfiePreview(URL.createObjectURL(blob))
        stopCamera()
      }
    }, 'image/jpeg', 0.9)
  }

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!frontFile) { setError('Please upload the front of your document'); return }
    if (!selfieBlob && !selfiePreview) { setError('Please take a selfie or upload a photo'); return }
    setIsLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const upload = async (file: File | Blob, path: string) => {
        const { error } = await supabase.storage.from('kyc-documents').upload(path, file, { upsert: true })
        if (error) throw error
        return supabase.storage.from('kyc-documents').getPublicUrl(path).data.publicUrl
      }

      const ts = Date.now()
      const frontUrl = await upload(frontFile, `${user.id}/front-${ts}`)
      const backUrl = backFile ? await upload(backFile, `${user.id}/back-${ts}`) : null
      const selfieFile = selfieBlob ? new File([selfieBlob], 'selfie.jpg', { type: 'image/jpeg' }) : null
      const selfieUrl = selfieFile ? await upload(selfieFile, `${user.id}/selfie-${ts}`) : null

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
    } catch (e: any) {
      setError('Could not upload your documents. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const card: React.CSSProperties = { background: 'white', borderRadius: 16, padding: '20px 20px', border: '1px solid #F3F4F6', marginBottom: 12 }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }

  // ── DONE ──────────────────────────────────────────────
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

        {/* Header */}
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
                onKeyDown={e => e.key === 'Enter' && goToUpload()}
              />
              {docNumberError && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{docNumberError}</p>}
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>Format: {DOC_NUMBER_HINT[docType]}</p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => router.push('/dashboard/settings')}
                style={{ flex: 1, height: 48, background: 'none', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={goToUpload}
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
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Upload a clear photo of your {DOC_LABELS[docType]}.</p>

            {[
              { label: 'Front of Document *', file: frontFile, preview: frontPreview, onChange: pickFile(f => setFrontFile(f), s => setFrontPreview(s)), required: true },
              { label: 'Back of Document', file: backFile, preview: backPreview, onChange: pickFile(f => setBackFile(f), s => setBackPreview(s)), required: false },
            ].map(({ label, file, preview, onChange, required }) => (
              <div key={label} style={card}>
                <label style={lbl}>{label}</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${file ? '#22C55E' : '#E5E7EB'}`, borderRadius: 10, padding: 20, cursor: 'pointer', background: file ? '#F0FDF4' : '#F9FAFB', minHeight: 100 }}>
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={onChange} />
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

        {/* ── STEP 3: Selfie via camera ── */}
        {step === 'selfie' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Take a Selfie</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Take a live photo of yourself holding your document. This confirms your identity.</p>

            <div style={card}>
              {selfiePreview ? (
                <div style={{ textAlign: 'center' }}>
                  <img src={selfiePreview} alt="selfie" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
                  <button onClick={() => { setSelfieBlob(null); setSelfiePreview('') }}
                    style={{ fontSize: 13, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Retake photo
                  </button>
                </div>
              ) : cameraActive ? (
                <div style={{ textAlign: 'center' }}>
                  <video ref={cameraRef} style={{ width: '100%', borderRadius: 10, marginBottom: 12, background: '#000', maxHeight: 280 }} autoPlay muted playsInline />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={stopCamera}
                      style={{ flex: 1, height: 44, background: 'none', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={captureSelfie}
                      style={{ flex: 2, height: 44, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      📸 Capture
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🤳</div>
                  <p style={{ fontSize: 14, color: '#374151', fontWeight: 500, marginBottom: 6 }}>Open your camera to take a selfie</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20, lineHeight: 1.5 }}>Hold your ID document next to your face</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button onClick={startCamera}
                      style={{ height: 46, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      📷 Open Camera
                    </button>
                    <label style={{ display: 'block', textAlign: 'center', padding: '12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#6B7280', cursor: 'pointer' }}>
                      <input type="file" accept="image/*" capture="user" style={{ display: 'none' }}
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) { setSelfieBlob(f); setSelfiePreview(URL.createObjectURL(f)) }
                        }} />
                      Or upload a photo instead
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { stopCamera(); setStep('upload') }}
                style={{ flex: 1, height: 48, background: 'none', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={handleSubmit} disabled={isLoading || (!selfieBlob && !selfiePreview)}
                style={{ flex: 2, height: 48, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: (!selfieBlob && !selfiePreview) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isLoading ? <><span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Submitting...</> : 'Submit Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
