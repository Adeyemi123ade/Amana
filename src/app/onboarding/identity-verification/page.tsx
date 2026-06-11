'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, CheckCircle, Shield } from 'lucide-react'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DocType = 'NIN' | 'PASSPORT' | 'DRIVER_LICENSE'

interface UploadedFile {
  file: File
  preview: string
}

export default function IdentityVerificationPage() {
  const router = useRouter()
  const supabase = createSupabase()
  const [docType, setDocType] = useState<DocType>('NIN')
  const [frontDoc, setFrontDoc] = useState<UploadedFile | null>(null)
  const [backDoc, setBackDoc] = useState<UploadedFile | null>(null)
  const [selfie, setSelfie] = useState<UploadedFile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (
    setter: (f: UploadedFile) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.')
      return
    }
    const preview = URL.createObjectURL(file)
    setter({ file, preview })
    setError('')
  }

  const handleSubmit = async () => {
    if (!frontDoc || !selfie) {
      setError('Please upload the required documents.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const uploadFile = async (file: File, path: string) => {
        const { error } = await supabase.storage
          .from('kyc-documents')
          .upload(path, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('kyc-documents').getPublicUrl(path)
        return data.publicUrl
      }

      const frontUrl = await uploadFile(frontDoc.file, `${user.id}/front-${Date.now()}`)
      const backUrl = backDoc ? await uploadFile(backDoc.file, `${user.id}/back-${Date.now()}`) : null
      const selfieUrl = await uploadFile(selfie.file, `${user.id}/selfie-${Date.now()}`)

      // Save KYC submission record
      await supabase.from('kyc_submissions').upsert({
        user_id: user.id,
        document_type: docType,
        front_image_url: frontUrl,
        back_image_url: backUrl,
        selfie_url: selfieUrl,
        status: 'PENDING',
      })

      router.push('/onboarding/business-information')
    } catch {
      setError('We could not upload your documents. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const FileUploadBox = ({
    label,
    value,
    onChange,
    required,
  }: {
    label: string
    value: UploadedFile | null
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 transition-colors hover:border-purple-400 hover:bg-purple-50">
        {value ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{value.file.name}</span>
          </div>
        ) : (
          <>
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="mt-1 text-xs text-gray-500">JPG, PNG or PDF (max 5MB)</span>
          </>
        )}
        <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={onChange} />
      </label>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Verify your identity</h2>
            <p className="text-sm text-gray-500">To keep your business and customers safe</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Document type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Document type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="NIN">National ID (NIN)</option>
              <option value="PASSPORT">International Passport</option>
              <option value="DRIVER_LICENSE">Driver&apos;s License</option>
            </select>
          </div>

          <FileUploadBox
            label="Upload front of ID"
            value={frontDoc}
            onChange={(e) => handleFileSelect(setFrontDoc, e)}
            required
          />

          <FileUploadBox
            label="Upload back of ID"
            value={backDoc}
            onChange={(e) => handleFileSelect(setBackDoc, e)}
          />

          <FileUploadBox
            label="Selfie with ID"
            value={selfie}
            onChange={(e) => handleFileSelect(setSelfie, e)}
            required
          />

          <ul className="space-y-1 rounded-lg bg-gray-50 p-3">
            {[
              'Government issued ID only',
              'Clear and readable photo',
              'All corners must be visible',
            ].map((rule) => (
              <li key={rule} className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                {rule}
              </li>
            ))}
          </ul>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            size="lg"
            loading={isLoading}
          >
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  )
}
