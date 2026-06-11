import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111827] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600">
            <span className="text-sm font-bold text-white">R</span>
          </div>
          <span className="text-xl font-bold text-white">ROS</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Run your business.
            <br />
            <span className="text-purple-400">Get paid faster.</span>
            <br />
            Stay organized.
          </h1>
          <p className="text-gray-400 text-lg">
            The all-in-one platform to manage invoices, customers, appointments and grow your business.
          </p>

          <ul className="space-y-3">
            {[
              'Create invoices in seconds',
              'Track payments automatically',
              'Never miss a booking again',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 text-xs">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-600 text-sm">Trusted by 12,000+ businesses</p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
