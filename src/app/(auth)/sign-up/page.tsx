'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'
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

const inputClass = "w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-colors"
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-1 text-sm text-gray-500">Let us get your business account set up.</p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">

          {/* Country */}
          <div>
            <label className={labelClass}>Country</label>
            <select {...register('country')} className={inputClass}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
          </div>

          {/* Full name */}
          <div>
            <label className={labelClass}>Full name</label>
            <input className={inputClass} placeholder="John Doe" {...register('fullName')} />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email address</label>
            <input type="email" className={inputClass} placeholder="john@example.com" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Phone number</label>
            <input type="tel" className={inputClass} placeholder="+234 812 345 6789" {...register('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={inputClass + ' pr-11'}
                placeholder="Create a strong password"
                {...register('password')}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            <PasswordStrengthBar password={password} />
          </div>

          {/* Confirm password */}
          <div>
            <label className={labelClass}>Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className={inputClass + ' pr-11'}
                placeholder="Repeat your password"
                {...register('confirmPassword')}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 pt-1">
            <input id="terms" type="checkbox" {...register('termsAccepted')} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#7C3AED] flex-shrink-0" />
            <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
              I agree to the <span className="text-[#7C3AED]">Terms of Service</span> and <span className="text-[#7C3AED]">Privacy Policy</span>
            </label>
          </div>
          {errors.termsAccepted && <p className="text-xs text-red-500">{errors.termsAccepted.message}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-[#7C3AED] text-white font-semibold text-base hover:bg-[#6D28D9] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isLoading && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            Create Account
          </button>
        </div>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-[#7C3AED] hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
