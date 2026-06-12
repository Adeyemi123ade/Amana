import { createClient } from '@/lib/supabase/server'
import { FileText, Users, CalendarDays, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils'
import { InvoiceStatusBadge } from '@/components/shared/StatusBadge'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('created_by', user?.id)
    .single()

  const currency = workspace?.currency || 'NGN'
  const workspaceId = workspace?.id

  const [
    { data: invoices },
    { data: customers },
    { data: appointments },
    { data: payments },
  ] = await Promise.all([
    supabase.from('invoices').select('*, customers(name)').eq('workspace_id', workspaceId || '').order('created_at', { ascending: false }).limit(20),
    supabase.from('customers').select('id').eq('workspace_id', workspaceId || ''),
    supabase.from('appointments').select('*, customers(name)').eq('workspace_id', workspaceId || '').gte('start_time', new Date().toISOString().split('T')[0]).order('start_time', { ascending: true }).limit(5),
    supabase.from('payments').select('*').eq('workspace_id', workspaceId || '').order('created_at', { ascending: false }).limit(5),
  ])

  const totalRevenue = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
  const unpaidInvoices = (invoices || []).filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE')
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0)
  const recentInvoices = (invoices || []).slice(0, 5)
  const todayAppts = (appointments || []).filter(a => new Date(a.start_time).toDateString() === new Date().toDateString())
  const overdueCount = (invoices || []).filter(i => i.status === 'OVERDUE').length
  const unconfirmedCount = (appointments || []).filter(a => a.status === 'PENDING').length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🏗️</div>
        <h2 className="text-xl font-bold text-gray-900">Complete your setup</h2>
        <p className="mt-2 text-gray-500 text-sm max-w-sm">You need to finish setting up your business profile to access your dashboard.</p>
        <Link href="/onboarding/business-information" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]">
          Complete Setup
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {name} 👋</h1>
          <p className="mt-0.5 text-sm text-gray-500">Here is what is happening with your business today.</p>
        </div>
        <Link href="/dashboard/invoices/create" className="hidden sm:flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6D28D9] transition-colors">
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* Stat cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue, currency),
            sub: '+12.5% this month',
            subColor: 'text-green-600',
            icon: TrendingUp,
            iconBg: 'bg-purple-50',
            iconColor: 'text-[#7C3AED]',
          },
          {
            label: 'Unpaid Invoices',
            value: formatCurrency(unpaidAmount, currency),
            sub: `${unpaidInvoices.length} invoices`,
            subColor: 'text-gray-500',
            icon: FileText,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            valueColor: 'text-red-500',
          },
          {
            label: "Today's Appointments",
            value: String(todayAppts.length),
            sub: `${todayAppts.filter(a => a.status === 'CONFIRMED').length} confirmed`,
            subColor: 'text-gray-500',
            icon: CalendarDays,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
          },
          {
            label: 'Customers',
            value: String((customers || []).length),
            sub: '+8 this month',
            subColor: 'text-blue-600',
            icon: Users,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">{card.label}</p>
                <p className={`mt-1.5 text-2xl font-bold truncate ${card.valueColor || 'text-gray-900'}`}>{card.value}</p>
                <p className={`mt-0.5 text-xs ${card.subColor}`}>{card.sub}</p>
              </div>
              <div className={`rounded-xl p-2.5 ml-3 flex-shrink-0 ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attention */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">What needs your attention</h3>
          <div className="space-y-3">
            {[
              { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: `${overdueCount} invoices overdue`, href: '/dashboard/invoices' },
              { icon: CalendarDays, color: 'text-orange-500', bg: 'bg-orange-50', label: `${unconfirmedCount} appointments unconfirmed`, href: '/dashboard/appointments' },
              { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', label: `${(customers || []).length} total customers`, href: '/dashboard/customers' },
            ].map(item => (
              <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                <div className={`rounded-lg p-2 ${item.bg} flex-shrink-0`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent invoices */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Invoices</h3>
            <Link href="/dashboard/invoices" className="text-xs font-medium text-[#7C3AED] hover:underline">View all</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No invoices yet</p>
              <Link href="/dashboard/invoices/create" className="mt-2 inline-block text-xs text-[#7C3AED] font-medium hover:underline">
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentInvoices.map(invoice => (
                <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {(invoice as any).customers?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{(invoice as any).customers?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{invoice.invoice_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(Number(invoice.total_amount), currency)}</span>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Today's Schedule</h3>
          <Link href="/dashboard/appointments" className="text-xs font-medium text-[#7C3AED] hover:underline">View calendar</Link>
        </div>
        {todayAppts.length === 0 ? (
          <div className="py-8 text-center">
            <CalendarDays className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No appointments today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayAppts.map(appt => (
              <div key={appt.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-sm font-medium text-gray-400 w-16 flex-shrink-0">{formatTime(appt.start_time)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{(appt as any).customers?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400 truncate">{appt.title}</p>
                </div>
                <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                  appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                }`}>
                  {appt.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
