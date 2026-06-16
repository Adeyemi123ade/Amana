import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey || secretKey.includes('PASTE_YOUR')) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    // ── VERIFY PAYSTACK SIGNATURE ─────────────────────────
    // This is critical — without it anyone can POST fake payment confirmations
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const expectedSig = createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    // Only process successful charge events
    if (event.event !== 'charge.success') {
      return NextResponse.json({ received: true, processed: false })
    }

    const txData = event.data
    const reference = txData.reference
    const amountPaid = txData.amount / 100
    const currency = txData.currency || 'NGN'
    const customerEmail = txData.customer?.email || null
    const paidAt = txData.paid_at || new Date().toISOString()

    // Extract invoice_id from metadata (set during checkout)
    const invoiceId = txData.metadata?.invoice_id
    if (!invoiceId) {
      // Not an Amana invoice payment — ignore
      return NextResponse.json({ received: true, processed: false })
    }

    const supabase = getSupabase()

    // ── IDEMPOTENCY ───────────────────────────────────────
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('paystack_ref', reference)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true, processed: false, reason: 'Already processed' })
    }

    // ── FETCH INVOICE ─────────────────────────────────────
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, workspace_id, status, invoice_number')
      .eq('id', invoiceId)
      .single()

    if (!invoice || invoice.status === 'PAID') {
      return NextResponse.json({ received: true, processed: false })
    }

    // ── UPDATE INVOICE ────────────────────────────────────
    await supabase.from('invoices').update({
      status: 'PAID',
      paid_at: paidAt,
      payment_method: 'Paystack',
      paystack_ref: reference,
    }).eq('id', invoiceId)

    // ── WRITE PAYMENT RECORD ──────────────────────────────
    await supabase.from('payments').insert({
      workspace_id: invoice.workspace_id,
      invoice_id: invoiceId,
      amount: amountPaid,
      currency,
      method: 'Paystack',
      paystack_ref: reference,
      customer_email: customerEmail,
      status: 'SUCCESS',
    })

    // ── NOTIFY BUSINESS OWNER ─────────────────────────────
    await supabase.from('notifications').insert({
      workspace_id: invoice.workspace_id,
      title: 'Payment Received',
      description: `Invoice ${invoice.invoice_number} — ${currency} ${amountPaid.toLocaleString()} confirmed via Paystack`,
      type: 'payment',
      read: false,
      link: `/dashboard/invoices/${invoiceId}`,
    })

    return NextResponse.json({ received: true, processed: true })

  } catch (err: any) {
    console.error('Webhook error:', err)
    // Always return 200 to Paystack so it does not retry
    return NextResponse.json({ received: true, error: err.message }, { status: 200 })
  }
}
