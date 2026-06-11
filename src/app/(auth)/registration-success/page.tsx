import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Confetti / celebration icon */}
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100">
            <span className="text-5xl">🎉</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">You&apos;re all set!</h1>
          <p className="text-gray-500 text-base">
            Your business account is ready. Let&apos;s start growing your revenue.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">Account verified</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4 text-left">
          <p className="text-sm font-semibold text-gray-700">What you can do now:</p>
          <ul className="space-y-3">
            {[
              { emoji: '📄', text: 'Create and send invoices in seconds' },
              { emoji: '📅', text: 'Set up your booking page for customers' },
              { emoji: '💰', text: 'Accept payments via Paystack' },
              { emoji: '🔔', text: 'Automate payment reminders' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">{item.emoji}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/dashboard" className="block">
          <Button className="w-full" size="lg">
            Proceed to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
