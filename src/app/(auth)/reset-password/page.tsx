'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthBar } from '@/components/forms/PasswordStrengthBar'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password', '')

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setServerError('')
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) { setServerError('We could not complete that action right now.'); return }
      router.push('/sign-in')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Create new password</h2>
        <p className="mt-0.5 text-sm text-gray-500">Enter your new password below.</p>
      </div>
      {serverError && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Label>New password</Label>
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" {...register('password')} error={errors.password?.message} className="pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
        </div>
        <div className="space-y-1">
          <Label>Confirm password</Label>
          <div className="relative">
            <Input type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" {...register('confirmPassword')} error={errors.confirmPassword?.message} className="pr-10" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-gray-400">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isLoading}>Reset Password</Button>
      </form>
      <p className="text-center text-sm">
        <Link href="/sign-in" className="text-[#7C3AED] hover:underline">Back to sign in</Link>
      </p>
    </div>
  )
}
