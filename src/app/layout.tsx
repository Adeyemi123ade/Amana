import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amana — Revenue Operating System',
  description: 'Run your business. Get paid faster. Stay organized.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{margin:0, padding:0, fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", WebkitFontSmoothing:'antialiased'}}>
        {children}
      </body>
    </html>
  )
}
