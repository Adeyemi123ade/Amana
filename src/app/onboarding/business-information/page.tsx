'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { businessInfoSchema, type BusinessInfoFormData } from '@/lib/validations/auth'
import { generateSlug } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

const BUSINESS_SIZES = [
  'Just me (solo)',
  '2–5 people',
  '6–10 people',
  '11–25 people',
  '25+ people',
]

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom',
  'United States', 'Canada', 'Australia', 'Other',
]

export default function BusinessInformationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: { country: 'Nigeria', currency: 'NGN' },
  })

  const onSubmit = async (data: BusinessInfoFormData) => {
    setIsLoading(true)
    setServerError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate unique slug
      const baseSlug = generateSlug(data.businessName)
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

      // Insert workspace
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
        throw workspaceError
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: { onboarding_complete: true },
      })

      router.push('/registration-success')
    } catch {
      setServerError('We could not save your business details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
          <p className="mt-1 text-sm text-gray-500">Tell us about your business.</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Business Name</Label>
              <Input
                placeholder="John's Photography"
                {...register('businessName')}
                error={errors.businessName?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Business Type</Label>
              <select
                {...register('businessType')}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.businessType && (
                <p className="text-xs text-red-500">{errors.businessType.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Business Size</Label>
              <select
                {...register('businessSize')}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Select size</option>
                {BUSINESS_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.businessSize && (
                <p className="text-xs text-red-500">{errors.businessSize.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Business Email (optional)</Label>
              <Input
                type="email"
                placeholder="business@example.com"
                {...register('businessEmail')}
                error={errors.businessEmail?.message}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Business Address</Label>
              <Input
                placeholder="Lagos, Nigeria"
                {...register('businessAddress')}
                error={errors.businessAddress?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Country</Label>
              <select
                {...register('country')}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Currency</Label>
              <select
                {...register('currency')}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Website (optional)</Label>
              <Input
                type="url"
                placeholder="https://yourwebsite.com"
                {...register('website')}
                error={errors.website?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Instagram (optional)</Label>
              <Input placeholder="@yourhandle" {...register('instagram')} />
            </div>

            <div className="space-y-1.5">
              <Label>WhatsApp Number (optional)</Label>
              <Input placeholder="+234 812 345 6789" {...register('whatsappNumber')} />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  )
}
