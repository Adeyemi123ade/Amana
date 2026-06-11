import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function InvoicesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
        <Link
          href="/dashboard/invoices/create"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Link>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
        <p className="text-gray-400 text-sm">No invoices yet. Create your first one above.</p>
      </div>
    </div>
  )
}
