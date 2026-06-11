import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ROS — Revenue Operating System',
  description: 'Run your business. Get paid faster. Stay organized.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', minHeight: '100vh', backgroundColor: '#F9FAFB', color: '#111827' }}>
        {children}
      </body>
    </html>
  )
}
