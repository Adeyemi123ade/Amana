import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()
    if (!invoiceId) return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey || resendKey.includes('PASTE_YOUR')) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const supabase = getSupabase()
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, customers(*), workspaces(*)')
      .eq('id', invoiceId)
      .single()

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const customer = invoice.customers
    const workspace = invoice.workspaces

    if (!customer?.email) {
      return NextResponse.json({ error: 'Customer has no email address' }, { status: 400 })
    }

    const currency = workspace?.currency || 'NGN'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
    const paymentLink = `${appUrl}/invoice/${invoiceId}`
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    const amount = new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(Number(invoice.total_amount))

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <div style="text-align:center;margin-bottom:24px">
          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;margin-right:10px;">
  <tr><td style="background:#7C3AED;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;padding:0;">
    <table cellpadding="0" cellspacing="2" border="0" style="margin:0 auto;">
      <tr>
        <td style="background:white;width:10px;height:10px;border-radius:2px;"></td>
        <td style="background:white;width:10px;height:10px;border-radius:2px;"></td>
      </tr>
      <tr>
        <td style="background:white;width:10px;height:10px;border-radius:2px;"></td>
        <td style="background:white;width:10px;height:10px;border-radius:2px;"></td>
      </tr>
    </table>
  </td></tr>
</table>
          <span style="font-size:20px;font-weight:800;color:#111827;vertical-align:middle">Amana</span>
        </div>

        <h2 style="font-size:20px;color:#111827;margin-bottom:6px">Invoice ${invoice.invoice_number}</h2>
        <p style="color:#6B7280;font-size:14px;margin-bottom:24px">Dear ${customer.name}, please find your invoice details below.</p>

        <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:20px;text-align:center;margin-bottom:24px">
          <p style="font-size:12px;color:#7C3AED;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Amount Due</p>
          <p style="font-size:32px;font-weight:900;color:#111827;margin:0">${amount}</p>
          <p style="font-size:13px;color:#6B7280;margin-top:6px">Due: ${dueDate}</p>
        </div>

        <div style="background:#F9FAFB;border-radius:10px;padding:16px;margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:13px;color:#6B7280">Invoice Number</span>
            <span style="font-size:13px;font-weight:600;color:#111827">${invoice.invoice_number}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="font-size:13px;color:#6B7280">From</span>
            <span style="font-size:13px;font-weight:600;color:#111827">${workspace?.name || 'Business'}</span>
          </div>
        </div>

        <a href="${paymentLink}" style="display:block;background:#7C3AED;color:white;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:15px;font-weight:700;text-align:center;margin-bottom:16px">
          Pay Now →
        </a>

        <p style="font-size:12px;color:#9CA3AF;text-align:center">
          Or copy this link: <a href="${paymentLink}" style="color:#7C3AED">${paymentLink}</a>
        </p>

        <hr style="border:none;border-top:1px solid #F3F4F6;margin:20px 0"/>
        <p style="font-size:11px;color:#D1D5DB;text-align:center">
          Sent by ${workspace?.name || 'Business'} via Amana
        </p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Amana Help Desk <noreply@chichatapp.com>',
        to: [customer.email],
        subject: `Invoice ${invoice.invoice_number} from ${workspace?.name || 'Business'} — Payment Request`,
        html,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.message || 'Email send failed' }, { status: 500 })
    }

    // Log notification
    await supabase.from('notifications').insert({
      workspace_id: invoice.workspace_id,
      title: 'Invoice Email Sent',
      description: `Invoice ${invoice.invoice_number} sent to ${customer.email}`,
      type: 'invoice',
      read: false,
      link: `/dashboard/invoices/${invoiceId}`,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
