'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { OTPInput } from '@/components/forms/OTPInput'

export default function VerificationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const email = typeof window !== 'undefined'
    ? sessionStorage.getItem('ros_verify_email') || ''
    : ''

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Please enter the complete 6-digit code.'); return }
    setIsLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (error) {
        setError(error.message.includes('expired')
          ? 'This code has expired. Please request a new one.'
          : 'That code is incorrect. Please try again.')
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE9FE]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="#7C3AED" opacity="0.2" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Verify it is you</h2>
        <p className="mt-2 text-sm text-gray-500">We sent a verification code to</p>
        <p className="text-sm font-semibold text-gray-900">{email}</p>
        <p className="mt-1 text-sm text-gray-500">Enter the 6-digit code below.</p>
      </div>
      {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}
      <OTPInput length={6} value={otp} onChange={setOtp} />
      <Button className="w-full" size="lg" onClick={handleVerify} loading={isLoading} disabled={otp.length !== 6}>
        Verify Code
      </Button>
      <p className="text-sm text-gray-500">
        Did not receive code?{' '}
        <button className="font-medium text-[#7C3AED] hover:underline">Resend (45s)</button>
      </p>
      <Link href="/sign-in" className="block text-sm text-gray-500 hover:text-[#7C3AED]">
        Use a different method
      </Link>
    </div>
  )
}
