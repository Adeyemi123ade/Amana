import type { Metadata, Viewport } from 'next'
import './globals.css'
import BackForwardRefresh from '@/components/BackForwardRefresh'

export const metadata: Metadata = {
  title: 'Amana — Revenue Operating System',
  description: 'Run your business. Get paid faster. Stay organized.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <BackForwardRefresh />
        {children}
      </body>
    </html>
  )
}
