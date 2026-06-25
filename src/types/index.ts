export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER'
export type NotificationChannel = 'EMAIL' | 'WHATSAPP' | 'IN_APP' | 'PUSH'
export type AutomationType =
  | 'INVOICE_REMINDER'
  | 'APPOINTMENT_REMINDER'
  | 'FOLLOW_UP_REMINDER'
  | 'WEEKLY_SUMMARY'

export interface User {
  id: string
  supabaseId: string
  email: string
  fullName: string
  phone?: string
  country?: string
  kycStatus: KycStatus
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  businessType?: string
  businessEmail?: string
  businessAddress?: string
  country: string
  currency: string
  businessSize?: string
  website?: string
  instagram?: string
  whatsappNumber?: string
  logoUrl?: string
  createdAt: string
}

export interface Customer {
  id: string
  workspaceId: string
  name: string
  email?: string
  phone?: string
  tags: string[]
  totalSpent: number
  lastInteraction?: string
  createdAt: string
}

export interface InvoiceItem {
  description: string
  amount: number
}

export interface Invoice {
  id: string
  workspaceId: string
  customerId: string
  customer?: Customer
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  notes?: string
  totalAmount: number
  paymentMethod?: string
  paymentLinkUrl?: string
  paidAt?: string
  createdAt: string
}

export interface Appointment {
  id: string
  workspaceId: string
  customerId: string
  customer?: Customer
  title: string
  service?: string
  startTime: string
  endTime?: string
  location?: string
  locationType: 'ONLINE' | 'PHYSICAL'
  notes?: string
  status: AppointmentStatus
  createdAt: string
}

export interface Payment {
  id: string
  workspaceId: string
  invoiceId?: string
  invoice?: Invoice
  amount: number
  currency: string
  method: string
  customerEmail?: string
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED'
  createdAt: string
}

export interface DashboardMetrics {
  totalRevenue: number
  unpaidInvoicesCount: number
  unpaidInvoicesAmount: number
  todayAppointmentsCount: number
  totalCustomers: number
  overdueInvoices: Invoice[]
  recentInvoices: Invoice[]
  todaySchedule: Appointment[]
  recentPayments: Payment[]
  attentionItems: {
    overdueInvoicesCount: number
    unconfirmedAppointmentsCount: number
    customersToFollowUpCount: number
    inactiveCustomersCount: number
  }
}

export interface AutomationRule {
  id: string
  workspaceId: string
  type: AutomationType
  triggerDays?: number
  channel: NotificationChannel
  active: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
