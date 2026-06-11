'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'waiting' | 'otp'>('waiting')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('ros_verify_email')
    if (!stored) { router.replace('/sign-up'); return }
    setEmail(stored)
  }, [router])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`)
      prev?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char })
    setOtp(newOtp)
    const nextEmpty = Math.min(pasted.length, 5)
    document.getElementById(`otp-${nextEmpty}`)?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit code.'); return }
    setIsVerifying(true)
    setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
      if (error) {
        setError(error.message.includes('expired')
          ? 'This code has expired. Request a new one.'
          : 'That code is incorrect. Please try again.')
        setOtp(['', '', '', '', '', ''])
        document.getElementById('otp-0')?.focus()
        return
      }
      router.push('/onboarding/identity-verification')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) { setError('Could not resend. Please try again.'); return }
      setCountdown(30)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
    } catch {
      setError('Something went wrong.')
    } finally {
      setIsResending(false)
    }
  }

  // STEP 1 — Waiting screen
  if (step === 'waiting') {
    return (
      <div className="text-center">
        {/* Email icon */}
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE9FE]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5"/>
              <path d="M2 8l10 6 10-6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
        <p className="text-sm text-gray-500 mb-1">We have sent a verification code to</p>
        <p className="text-sm font-semibold text-gray-900 mb-1">{email}</p>
        <p className="text-sm text-gray-500 mb-8">Please check your inbox and enter the code below.</p>

        <button
          onClick={() => setStep('otp')}
          className="w-full h-12 rounded-xl bg-[#7C3AED] text-white font-semibold text-base hover:bg-[#6D28D9] transition-colors mb-4"
        >
          Enter Verification Code
        </button>

        <p className="text-sm text-gray-500">
          {canResend ? (
            <button onClick={handleResend} disabled={isResending} className="font-medium text-[#7C3AED] hover:underline disabled:opacity-50">
              {isResending ? 'Resending...' : 'Resend email'}
            </button>
          ) : (
            <span>Resend email <span className="font-medium text-gray-700">({countdown}s)</span></span>
          )}
        </p>
      </div>
    )
  }

  // STEP 2 — OTP entry screen
  return (
    <div className="text-center">
      {/* Shield icon */}
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE9FE]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter the code</h2>
      <p className="text-sm text-gray-500 mb-1">We sent a 6-digit code to</p>
      <p className="text-sm font-semibold text-gray-900 mb-6">{email}</p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* 6 OTP boxes */}
      <div className="flex gap-2 justify-center mb-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKeyDown(i, e)}
            onPaste={handleOtpPaste}
            className="h-12 w-12 rounded-xl border-2 text-center text-lg font-bold text-gray-900 transition-colors focus:outline-none"
            style={{
              borderColor: digit ? '#7C3AED' : '#E5E7EB',
              backgroundColor: digit ? '#F5F3FF' : '#FFFFFF',
            }}
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={isVerifying || otp.join('').length !== 6}
        className="w-full h-12 rounded-xl bg-[#7C3AED] text-white font-semibold text-base hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
      >
        {isVerifying && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
        Verify Email
      </button>

      <p className="text-sm text-gray-500">
        {canResend ? (
          <button onClick={handleResend} disabled={isResending} className="font-medium text-[#7C3AED] hover:underline disabled:opacity-50">
            {isResending ? 'Resending...' : 'Resend code'}
          </button>
        ) : (
          <span>Resend code <span className="font-medium text-gray-700">({countdown}s)</span></span>
        )}
      </p>

      <button onClick={() => setStep('waiting')} className="mt-3 text-sm text-gray-400 hover:text-gray-600">
        Back
      </button>
    </div>
  )
}
