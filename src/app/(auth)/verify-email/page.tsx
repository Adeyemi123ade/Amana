'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('ros_verify_email')
    if (!stored) { router.replace('/sign-up'); return }
    setEmail(stored)
  }, [router])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResend = async () => {
    setIsResending(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) { setMessage('Could not resend. Please try again.'); return }
      setCountdown(30)
      setCanResend(false)
      setMessage('Email resent successfully.')
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6 text-center">
      {/* Purple email icon */}
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE9FE]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="3" fill="#7C3AED" opacity="0.15"/>
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="#7C3AED" strokeWidth="1.5"/>
            <path d="M2 7l10 7 10-7" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-500">
          We have sent a verification link to
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">{email}</p>
        <p className="mt-2 text-sm text-gray-500">
          Please check your inbox and click the link to verify your account.
        </p>
      </div>

      {message && (
        <p className="text-sm text-green-600">{message}</p>
      )}

      <Button className="w-full" size="lg" onClick={() => window.open('mailto:', '_blank')}>
        Open Email App
      </Button>

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
