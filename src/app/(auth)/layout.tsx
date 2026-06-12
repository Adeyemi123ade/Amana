import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight:'100vh',
      background:'#F5F5F5',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:'24px 16px'
    }}>
      <div style={{
        width:'100%',
        maxWidth:440,
        background:'white',
        borderRadius:20,
        padding:'36px 28px',
        boxShadow:'0 2px 16px rgba(0,0,0,0.08)',
      }}>
        {children}
      </div>
    </div>
  )
}
