import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'}}>
      {/* Topbar */}
      <nav className="flex items-center justify-between px-5 py-4 max-w-[390px] mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span className="text-base font-bold text-white">Amana</span>
        </div>
        <button className="flex flex-col gap-1.5 p-1">
          <span className="block h-0.5 w-5 bg-white rounded"></span>
          <span className="block h-0.5 w-5 bg-white rounded"></span>
          <span className="block h-0.5 w-5 bg-white rounded"></span>
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center px-5 py-10 max-w-[390px] mx-auto w-full">
        <h1 className="text-4xl font-extrabold text-white leading-tight">
          Run your business.<br/>
          Get paid faster.<br/>
          <span style={{color: '#A78BFA'}}>Stay organized.</span>
        </h1>
        <p className="mt-4 text-base text-gray-300">
          The all-in-one platform to manage invoices, customers, appointments and grow your business.
        </p>

        <ul className="mt-6 space-y-2.5">
          {['Create invoices in seconds','Track payments automatically','Never miss a booking again'].map(item => (
            <li key={item} className="flex items-center gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#7C3AED]">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span className="text-sm text-gray-300">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/sign-up" className="flex items-center justify-center rounded-xl bg-[#7C3AED] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#6D28D9]">
            Get Started Free
          </Link>
          <Link href="/sign-in" className="flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10">
            Watch Demo
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['#7C3AED','#6D28D9','#5B21B6','#4C1D95'].map((c, i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-[#312e81] flex items-center justify-center text-xs font-bold text-white" style={{background: c}}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400">Trusted by <span className="text-white font-medium">12,000+</span> businesses</p>
        </div>
      </div>
    </main>
  )
}
