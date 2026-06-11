import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-8">
      {/* Logo top left aligned with card */}
      <div className="w-full max-w-[390px] mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Amana</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[390px] bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-7">
        {children}
      </div>
    </div>
  )
}
