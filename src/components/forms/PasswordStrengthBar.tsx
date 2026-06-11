'use client'

import { useMemo } from 'react'
import { validatePassword } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PasswordStrengthBarProps {
  password: string
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = useMemo(() => validatePassword(password), [password])

  if (!password) return null

  const checks = [
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(password) },
    { label: 'At least one special character (!@#$*)', met: /[^A-Za-z0-9]/.test(password) },
    { label: 'Minimum 8 characters', met: password.length >= 8 },
  ]

  const strengthConfig = {
    Weak: { width: 'w-1/3', color: 'bg-red-400', textColor: 'text-red-500' },
    Medium: { width: 'w-2/3', color: 'bg-orange-400', textColor: 'text-orange-500' },
    Strong: { width: 'w-full', color: 'bg-green-500', textColor: 'text-green-600' },
  }

  const config = strengthConfig[strength]

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Password strength</span>
        <span className={cn('text-xs font-medium', config.textColor)}>{strength}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={cn('h-full rounded-full transition-all duration-300', config.width, config.color)}
        />
      </div>
      <ul className="space-y-1">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-1.5 text-xs">
            <span className={check.met ? 'text-green-500' : 'text-gray-300'}>
              {check.met ? '✓' : '○'}
            </span>
            <span className={check.met ? 'text-gray-600' : 'text-gray-400'}>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
