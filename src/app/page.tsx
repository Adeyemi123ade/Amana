import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#111827] text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
            <span className="text-sm font-bold">R</span>
          </div>
          <span className="text-lg font-bold">ROS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-gray-400 hover:text-white px-4 py-2">Sign in</Link>
          <Link href="/sign-up" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">Get Started Free</Link>
        </div>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center py-24">
        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight">
          Stop Losing Money<br />
          <span className="text-purple-400">In Your Business</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-400">
          The all-in-one platform to manage invoices, customers, appointments and grow your business.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/sign-up" className="rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold hover:bg-purple-700">Start Free Trial</Link>
          <Link href="/sign-in" className="rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold hover:bg-white/5">Sign In</Link>
        </div>
      </div>
    </main>
  )
}
