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

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, customers(*)')
      .eq('id', invoiceId)
      .single()

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    if (invoice.status === 'PAID') return NextResponse.json({ error: 'This invoice has already been paid.' }, { status: 400 })

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id, name, currency')
      .eq('id', invoice.workspace_id)
      .single()

    const customerEmail = (invoice.customers?.email || '').trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      return NextResponse.json({
        error: 'Customer email is missing or invalid. Please add a valid email address to the customer profile before payment can proceed.',
      }, { status: 400 })
    }

    const rawAmount = Number(invoice.total_amount)
    if (!rawAmount || rawAmount <= 0 || isNaN(rawAmount)) {
      return NextResponse.json({ error: 'Invoice total amount is invalid.' }, { status: 400 })
    }

    const amount = Math.round(rawAmount * 100)
    const currencyMap: Record<string, string> = { NGN:'NGN', GHS:'GHS', ZAR:'ZAR', USD:'USD', KES:'KES' }
    const currency = currencyMap[workspace?.currency || ''] || 'NGN'

    // REQUIREMENT 1: Generate reference and store it against the invoice BEFORE charging
    const ref = 'AMN-' + invoice.invoice_number + '-' + Date.now()
    await supabase.from('invoices').update({ paystack_reference: ref }).eq('id', invoiceId)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
    const callbackUrl = appUrl + '/payment/verify?invoiceId=' + invoiceId

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + secretKey,
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
          business_name: workspace?.name,
          customer_name: invoice.customers?.name,
        },
      }),
    })

    const initData = await initRes.json()

    if (!initRes.ok || !initData.status) {
      return NextResponse.json({
        error: initData.message || 'Could not start payment. Please try again.',
        debug: {
          paystackStatus: initData.status,
          paystackMessage: initData.message,
          emailUsed: customerEmail,
          amountKobo: amount,
          currency,
        },
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      authorization_url: initData.data.authorization_url,
      reference: ref,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
