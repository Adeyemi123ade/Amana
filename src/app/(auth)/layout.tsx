import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[390px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span className="text-lg font-bold text-gray-900">ROS</span>
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
