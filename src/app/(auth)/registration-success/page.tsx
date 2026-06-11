import Link from 'next/link'

export default function RegistrationSuccessPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="text-6xl">🎉</div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">You are all set!</h2>
        <p className="text-sm text-gray-500">Your business account is ready.</p>
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs font-medium text-green-700">Account status: Verified</span>
        </div>
      </div>
      <Link href="/sign-in" className="flex items-center justify-center rounded-xl bg-[#7C3AED] px-6 py-3 text-base font-semibold text-white hover:bg-[#6D28D9]">
        Go to Sign In
      </Link>
    </div>
  )
}
