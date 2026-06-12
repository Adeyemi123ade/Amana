import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 self-start" style={{marginLeft: 'max(20px, calc(50vw - 220px))'}}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
        </div>
        <span className="text-lg font-bold text-gray-900">Amana</span>
      </div>

      {/* Card with generous padding and spacing */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-md border border-gray-100" style={{padding: '36px 32px'}}>
        {children}
      </div>
    </div>
  )
}
