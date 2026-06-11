import { Badge } from '@/components/ui/badge'
import type { InvoiceStatus, AppointmentStatus } from '@/types'

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = {
    DRAFT: { variant: 'secondary' as const, label: 'Draft' },
    UNPAID: { variant: 'warning' as const, label: 'Unpaid' },
    PAID: { variant: 'success' as const, label: 'Paid' },
    OVERDUE: { variant: 'destructive' as const, label: 'Overdue' },
    CANCELLED: { variant: 'secondary' as const, label: 'Cancelled' },
  }
  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = {
    PENDING: { variant: 'warning' as const, label: 'Pending' },
    CONFIRMED: { variant: 'success' as const, label: 'Confirmed' },
    COMPLETED: { variant: 'secondary' as const, label: 'Completed' },
    CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    NO_SHOW: { variant: 'destructive' as const, label: 'No Show' },
  }
  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
