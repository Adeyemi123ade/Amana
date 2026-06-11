'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthBar } from '@/components/forms/PasswordStrengthBar'

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria (+234)' },
  { code: 'GH', name: 'Ghana (+233)' },
  { code: 'KE', name: 'Kenya (+254)' },
  { code: 'ZA', name: 'South Africa (+27)' },
  { code: 'GB', name: 'United Kingdom (+44)' },
  { code: 'US', name: 'United States (+1)' },
  { code: 'CA', name: 'Canada (+1)' },
]

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { country: 'NG' },
  })

  const password = watch('password', '')

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setServerError('')
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName, phone: data.phone, country: data.country },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setServerError(error.message.includes('already registered')
          ? 'An account already exists with this email.'
          : 'Something went wrong. Please try again.')
        return
      }
      sessionStorage.setItem('ros_verify_email', data.email)
      router.push('/verify-email')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-0.5 text-sm text-gray-500">Let us get your business account set up.</p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Country */}
        <div className="space-y-1">
          <Label>Country</Label>
          <select {...register('country')} className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>

        {/* Full name */}
        <div className="space-y-1">
          <Label>Full name</Label>
          <Input placeholder="John Doe" {...register('fullName')} error={errors.fullName?.message} />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label>Email address</Label>
          <Input type="email" placeholder="john@example.com" {...register('email')} error={errors.email?.message} />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label>Phone number</Label>
          <Input type="tel" placeholder="+234 812 345 6789" {...register('phone')} error={errors.phone?.message} />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label>Password</Label>
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" {...register('password')} error={errors.password?.message} className="pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
        </div>

        {/* Confirm password */}
        <div className="space-y-1">
          <Label>Confirm password</Label>
          <div className="relative">
            <Input type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" {...register('confirmPassword')} error={errors.confirmPassword?.message} className="pr-10" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-gray-400">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input id="terms" type="checkbox" {...register('termsAccepted')} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#7C3AED]" />
          <label htmlFor="terms" className="text-xs text-gray-500">I agree to the Terms of Service and Privacy Policy</label>
        </div>
        {errors.termsAccepted && <p className="text-xs text-red-500">{errors.termsAccepted.message}</p>}

        <Button type="submit" className="w-full" size="lg" loading={isLoading}>Create Account</Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-[#7C3AED] hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
