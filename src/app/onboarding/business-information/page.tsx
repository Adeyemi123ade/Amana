'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { businessInfoSchema, type BusinessInfoFormData } from '@/lib/validations/auth'
import { generateSlug } from '@/lib/utils'

const BUSINESS_TYPES = [
  'Photography', 'Consulting', 'Freelance Design', 'Hair & Beauty', 'Fashion',
  'Coaching & Training', 'Real Estate', 'Food & Catering', 'Events & Planning',
  'Healthcare', 'Legal Services', 'Technology', 'Education', 'Other',
]
const CURRENCIES = [
  { code: 'NGN', label: 'Nigerian Naira (₦)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GHS', label: 'Ghanaian Cedi (GH₵)' },
  { code: 'KES', label: 'Kenyan Shilling (KSh)' },
  { code: 'ZAR', label: 'South African Rand (R)' },
]
const BUSINESS_SIZES = ['Just me (solo)', '2-5 people', '6-10 people', '11-25 people', '25+ people']
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'Australia', 'Other']

const inputClass = "w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-colors"
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

export default function BusinessInformationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: { country: 'Nigeria', currency: 'NGN' },
  })

  const onSubmit = async (data: BusinessInfoFormData) => {
    setIsLoading(true)
    setServerError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const baseSlug = generateSlug(data.businessName)
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

      const { error: workspaceError } = await supabase.from('workspaces').insert({
        name: data.businessName,
        slug,
        business_type: data.businessType,
        business_email: data.businessEmail || null,
        business_address: data.businessAddress,
        country: data.country,
        currency: data.currency,
        business_size: data.businessSize,
        website: data.website || null,
        instagram: data.instagram || null,
        whatsapp_number: data.whatsappNumber || null,
        created_by: user.id,
      })

      if (workspaceError) {
        console.error('Workspace error:', workspaceError)
        throw new Error(workspaceError.message)
      }

      await supabase.auth.updateUser({ data: { onboarding_complete: true } })
      router.push('/registration-success')
    } catch (err) {
      console.error(err)
      setServerError('We could not save your business details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Amana</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{padding: '36px 32px'}}>
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
            <p className="mt-1.5 text-sm text-gray-500">Tell us about your business to complete setup.</p>
          </div>

          {serverError && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{serverError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Business name */}
            <div>
              <label className={labelClass}>Business name</label>
              <input className={inputClass} placeholder="John's Photography" {...register('businessName')} />
              {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>}
            </div>

            {/* Type + Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Business type</label>
                <select {...register('businessType')} className={inputClass}>
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Business size</label>
                <select {...register('businessSize')} className={inputClass}>
                  <option value="">Select size</option>
                  {BUSINESS_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.businessSize && <p className="mt-1 text-xs text-red-500">{errors.businessSize.message}</p>}
              </div>
            </div>

            {/* Business email */}
            <div>
              <label className={labelClass}>Business email <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="email" className={inputClass} placeholder="business@example.com" {...register('businessEmail')} />
              {errors.businessEmail && <p className="mt-1 text-xs text-red-500">{errors.businessEmail.message}</p>}
            </div>

            {/* Address */}
            <div>
              <label className={labelClass}>Business address</label>
              <input className={inputClass} placeholder="Lagos, Nigeria" {...register('businessAddress')} />
              {errors.businessAddress && <p className="mt-1 text-xs text-red-500">{errors.businessAddress.message}</p>}
            </div>

            {/* Country + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Country</label>
                <select {...register('country')} className={inputClass}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select {...register('currency')} className={inputClass}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className={labelClass}>Website <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="url" className={inputClass} placeholder="https://yourwebsite.com" {...register('website')} />
              {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>}
            </div>

            {/* Instagram + WhatsApp */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Instagram <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className={inputClass} placeholder="@yourhandle" {...register('instagram')} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className={inputClass} placeholder="+234 812 345 6789" {...register('whatsappNumber')} />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#7C3AED] text-white font-semibold text-base hover:bg-[#6D28D9] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
