'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { OTPInput } from '@/components/forms/OTPInput'

export default function VerifyEmailPage() {
  const router = useRouter()
  const supabase = createClient()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('ros_verify_email')
    if (!storedEmail) {
      router.replace('/sign-up')
      return
    }
    setEmail(storedEmail)
  }, [router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      })

      if (error) {
        if (error.message.includes('expired')) {
          setError('This code has expired. Please request a new one.')
        } else {
          setError('That code is incorrect. Please try again.')
        }
        return
      }

      router.push('/onboarding/identity-verification')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        setError('Could not resend the code. Please try again.')
        return
      }

      setOtp('')
      setCountdown(60)
      setCanResend(false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-8 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
          <Mail className="h-10 w-10 text-purple-600" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-sm text-gray-500">
          We&apos;ve sent a 6-digit verification code to
        </p>
        <p className="mt-1 text-sm font-medium text-gray-900">{email}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <OTPInput length={6} value={otp} onChange={setOtp} disabled={isLoading} />

        <Button
          onClick={handleVerify}
          className="w-full"
          size="lg"
          loading={isLoading}
          disabled={otp.length !== 6}
        >
          Verify Email
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-purple-600 hover:underline disabled:opacity-50"
          >
            {isResending ? 'Resending...' : 'Resend code'}
          </button>
        ) : (
          <span>
            Resend code in{' '}
            <span className="font-medium text-gray-700">{countdown}s</span>
          </span>
        )}
      </div>
    </div>
  )
}
