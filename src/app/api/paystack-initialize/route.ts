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
    if (!invoiceId) return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey || secretKey.includes('PASTE_YOUR')) {
      return NextResponse.json({ error: 'Payment is not configured. Please contact the business.' }, { status: 500 })
    }

    const supabase = getSupabase()

    // Fetch invoice + customer + workspace
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, customers(*), workspaces(*)')
      .eq('id', invoiceId)
      .single()

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    if (invoice.status === 'PAID') return NextResponse.json({ error: 'This invoice has already been paid.' }, { status: 400 })

    const customerEmail = invoice.customers?.email
    if (!customerEmail) {
      return NextResponse.json({ error: 'No customer email on this invoice. The business must add a customer email.' }, { status: 400 })
    }

    const amount = Math.round(Number(invoice.total_amount) * 100) // kobo
    const currencyMap: Record<string, string> = { NGN:'NGN', GHS:'GHS', ZAR:'ZAR', USD:'USD', KES:'KES' }
    const currency = currencyMap[invoice.workspaces?.currency] || 'NGN'
    const ref = 'AMN-' + invoice.invoice_number + '-' + Date.now()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'

    // Use dedicated verify page — more reliable than the invoice page
    // Paystack appends ?reference=REF&trxref=REF to this URL
    const callbackUrl = `${appUrl}/payment/verify?invoiceId=${invoiceId}`

    // Initialize transaction on Paystack
    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        amount,
        currency,
        reference: ref,
        callback_url: callbackUrl,
        metadata: {
          invoice_id: invoiceId,
          invoice_number: invoice.invoice_number,
          business_name: invoice.workspaces?.name,
        },
      }),
    })

    const initData = await initRes.json()

    if (!initRes.ok || !initData.status) {
      return NextResponse.json({
        error: initData.message || 'Could not start payment. Please try again.',
      }, { status: 400 })
    }

    // Return the Paystack hosted checkout URL
    return NextResponse.json({
      success: true,
      authorization_url: initData.data.authorization_url,
      reference: ref,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
