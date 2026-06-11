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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
