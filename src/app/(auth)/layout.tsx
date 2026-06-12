import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{minHeight:'100vh', background:'#F9FAFB', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px'}}>
      <div style={{width:'100%', maxWidth:390, background:'white', borderRadius:20, padding:'32px 24px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', border:'1px solid #F3F4F6'}}>
        {children}
      </div>
    </div>
  )
}
