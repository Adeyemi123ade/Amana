// ─────────────────────────────────────────────────────────────
// AMANA ROLE-BASED PERMISSIONS
// ─────────────────────────────────────────────────────────────
// Roles (in order of authority):
//   OWNER  — full control, cannot be removed
//   ADMIN  — full control except deleting workspace/owner
//   STAFF  — can create and edit, cannot delete or manage team
//   VIEWER — read-only access

export type Role = 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER' | 'NONE'

export const ROLE_LABELS: Record<Role, string> = {
  OWNER:  'Owner',
  ADMIN:  'Admin',
  STAFF:  'Staff',
  VIEWER: 'Viewer',
  NONE:   'No Access',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER:  'Full control including workspace settings and billing',
  ADMIN:  'Full access except workspace deletion and owner management',
  STAFF:  'Can create and edit customers, invoices and appointments',
  VIEWER: 'Read-only access — can view but not create or edit',
  NONE:   'No access to this workspace',
}

// Permission matrix
const PERMISSIONS = {
  // Invoices
  'invoice.view':   ['OWNER','ADMIN','STAFF','VIEWER'],
  'invoice.create': ['OWNER','ADMIN','STAFF'],
  'invoice.edit':   ['OWNER','ADMIN','STAFF'],
  'invoice.delete': ['OWNER','ADMIN'],
  'invoice.send':   ['OWNER','ADMIN','STAFF'],

  // Customers
  'customer.view':   ['OWNER','ADMIN','STAFF','VIEWER'],
  'customer.create': ['OWNER','ADMIN','STAFF'],
  'customer.edit':   ['OWNER','ADMIN','STAFF'],
  'customer.delete': ['OWNER','ADMIN'],

  // Appointments
  'appointment.view':   ['OWNER','ADMIN','STAFF','VIEWER'],
  'appointment.create': ['OWNER','ADMIN','STAFF'],
  'appointment.edit':   ['OWNER','ADMIN','STAFF'],
  'appointment.cancel': ['OWNER','ADMIN'],

  // Payments
  'payment.view': ['OWNER','ADMIN','STAFF','VIEWER'],

  // Reports
  'report.view': ['OWNER','ADMIN'],

  // Settings
  'settings.view':         ['OWNER','ADMIN'],
  'settings.edit':         ['OWNER','ADMIN'],
  'settings.team.manage':  ['OWNER'],
  'settings.billing':      ['OWNER'],

  // Reminders
  'reminder.view':   ['OWNER','ADMIN'],
  'reminder.toggle': ['OWNER','ADMIN'],
} as const

export type Permission = keyof typeof PERMISSIONS

export function can(role: Role, permission: Permission): boolean {
  if (role === 'NONE') return false
  const allowed = PERMISSIONS[permission] as readonly string[]
  return allowed.includes(role)
}

// Hook-friendly check — returns all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter(p => can(role, p))
}

// Used in UI to show/hide elements
export function canAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => can(role, p))
}
