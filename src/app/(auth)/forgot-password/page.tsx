'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setServerError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) { setServerError('Something went wrong. Please try again.'); return }
      setSent(true)
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Check your inbox</h2>
          <p className="mt-2 text-sm text-gray-500">We sent a password reset link to <span className="font-medium text-gray-900">{getValues('email')}</span></p>
        </div>
        <Link href="/sign-in"><Button variant="outline" className="w-full">Back to sign in</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FE]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#7C3AED" strokeWidth="1.5"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="mt-1 text-sm text-gray-500">Enter your email and we will send you a reset link.</p>
      </div>
      {serverError && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Label>Email address</Label>
          <Input type="email" placeholder="john@example.com" {...register('email')} error={errors.email?.message} />
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isLoading}>Send Reset Link</Button>
      </form>
      <p className="text-center text-sm text-gray-500">
        <Link href="/sign-in" className="text-[#7C3AED] hover:underline">Back to sign in</Link>
      </p>
    </div>
  )
}
