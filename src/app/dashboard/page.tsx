import { createClient } from '@/lib/supabase/server'
import { FileText, Users, CalendarDays, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { InvoiceStatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch workspace for this user
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('created_by', user?.id)
    .single()

  const currency = workspace?.currency || 'NGN'
  const workspaceId = workspace?.id

  // Parallel fetch of dashboard data
  const [
    { data: invoices },
    { data: customers },
    { data: appointments },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, customers(name)')
      .eq('workspace_id', workspaceId || '')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('customers')
      .select('id')
      .eq('workspace_id', workspaceId || ''),
    supabase
      .from('appointments')
      .select('*, customers(name)')
      .eq('workspace_id', workspaceId || '')
      .gte('start_time', new Date().toISOString().split('T')[0])
      .order('start_time', { ascending: true })
      .limit(5),
    supabase
      .from('payments')
      .select('*')
      .eq('workspace_id', workspaceId || '')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Compute metrics
  const totalRevenue = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
  const unpaidInvoices = (invoices || []).filter((i) => i.status === 'UNPAID' || i.status === 'OVERDUE')
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0)
  const recentInvoices = (invoices || []).slice(0, 5)
  const todayAppointments = (appointments || []).filter(
    (a) => new Date(a.start_time).toDateString() === new Date().toDateString()
  )

  const attentionItems = [
    {
      icon: AlertCircle,
      color: 'text-red-500 bg-red-50',
      label: `${unpaidInvoices.filter((i) => i.status === 'OVERDUE').length} invoices overdue`,
      href: '/dashboard/invoices?filter=overdue',
    },
    {
      icon: CalendarDays,
      color: 'text-orange-500 bg-orange-50',
      label: `${todayAppointments.filter((a) => a.status === 'PENDING').length} appointments unconfirmed`,
      href: '/dashboard/appointments',
    },
    {
      icon: Users,
      color: 'text-blue-500 bg-blue-50',
      label: `${(customers || []).length} total customers`,
      href: '/dashboard/customers',
    },
  ]

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-4xl mb-4">🏗️</div>
        <h2 className="text-xl font-semibold text-gray-900">Complete your setup</h2>
        <p className="mt-2 text-gray-500 text-sm">You need to finish setting up your business profile first.</p>
        <Link
          href="/onboarding/business-information"
          className="mt-4 inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          Complete Setup
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue, currency)}
                </p>
                <p className="mt-0.5 text-xs text-green-600">+12.5% this month</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Unpaid Invoices</p>
                <p className="mt-1 text-2xl font-bold text-red-500">
                  {formatCurrency(unpaidAmount, currency)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{unpaidInvoices.length} invoices</p>
              </div>
              <div className="rounded-lg bg-red-50 p-2">
                <FileText className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Today&apos;s Appointments</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {todayAppointments.filter((a) => a.status === 'CONFIRMED').length} confirmed
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-2">
                <CalendarDays className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Customers</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{(customers || []).length}</p>
                <p className="mt-0.5 text-xs text-blue-600">+8 this month</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* What needs attention */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">What needs your attention</h3>
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                >
                  <div className={`rounded-lg p-1.5 ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent invoices */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Invoices</h3>
              <Link href="/dashboard/invoices" className="text-xs text-purple-600 font-medium hover:underline">
                View all
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No invoices yet</p>
                <Link
                  href="/dashboard/invoices/create"
                  className="mt-2 inline-flex text-xs text-purple-600 font-medium hover:underline"
                >
                  Create your first invoice
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {(invoice as any).customers?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {(invoice as any).customers?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">{invoice.invoice_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(Number(invoice.total_amount), currency)}
                      </span>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's schedule */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Today&apos;s Schedule</h3>
            <Link href="/dashboard/appointments" className="text-xs text-purple-600 font-medium hover:underline">
              View calendar
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-6 text-center">
              <CalendarDays className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-16">
                      {formatTime(appt.start_time)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {(appt as any).customers?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400">{appt.title}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      appt.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {appt.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
