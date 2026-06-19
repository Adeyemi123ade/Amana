import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function sendConfirmationEmail(
  customerEmail: string,
  customerName: string,
  invoiceNumber: string,
  amount: number,
  currency: string,
  businessName: string,
  reference: string,
  paidAt: string
) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey.includes('PASTE_YOUR')) return

  const date = new Date(paidAt).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + resendKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Amana Help Desk <noreply@chichatapp.com>',
      to: [customerEmail],
      subject: 'Payment Confirmed — ' + invoiceNumber,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111827">
          <div style="text-align:center;margin-bottom:28px">
            <div style="display:inline-block;background:#7C3AED;width:36px;height:36px;border-radius:9px;vertical-align:middle;margin-right:8px"></div>
            <span style="font-size:20px;font-weight:800;color:#111827;vertical-align:middle">Amana</span>
          </div>

          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px">
            <div style="width:56px;height:56px;background:#22C55E;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
              <span style="color:white;font-size:28px">✓</span>
            </div>
            <h2 style="font-size:20px;font-weight:800;color:#15803D;margin-bottom:4px">Payment Confirmed</h2>
            <p style="color:#16A34A;font-size:14px">Your payment was received successfully</p>
          </div>

          <h3 style="font-size:15px;font-weight:700;color:#111827;margin-bottom:12px">Payment Details</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
            <tr style="border-bottom:1px solid #F3F4F6">
              <td style="padding:10px 0;color:#6B7280">Invoice Number</td>
              <td style="padding:10px 0;font-weight:600;color:#111827;text-align:right">${invoiceNumber}</td>
            </tr>
            <tr style="border-bottom:1px solid #F3F4F6">
              <td style="padding:10px 0;color:#6B7280">Amount Paid</td>
              <td style="padding:10px 0;font-weight:700;color:#16A34A;text-align:right;font-size:16px">${currency} ${amount.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom:1px solid #F3F4F6">
              <td style="padding:10px 0;color:#6B7280">Date</td>
              <td style="padding:10px 0;font-weight:600;color:#111827;text-align:right">${date}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280">Reference</td>
              <td style="padding:10px 0;font-weight:500;color:#374151;text-align:right;font-size:12px">${reference}</td>
            </tr>
          </table>

          <p style="font-size:13px;color:#6B7280;text-align:center;line-height:1.6">
            Thank you, ${customerName}. Please keep this email as your payment receipt.
          </p>
          <hr style="border:none;border-top:1px solid #F3F4F6;margin:20px 0"/>
          <p style="font-size:11px;color:#D1D5DB;text-align:center">Processed by ${businessName} via Amana</p>
        </div>
      `,
    }),
  }).catch(e => console.error('Confirmation email failed:', e))
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  let logId: string | null = null
  let rawBody = ''

  try {
    rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    // REQUIREMENT 9: Log every incoming webhook event
    const preLog = await supabase.from('webhook_logs').insert({
      event: 'incoming',
      status: 'received',
      payload: { body_length: rawBody.length, has_signature: !!signature },
    }).select('id').single()
    logId = preLog.data?.id || null

    if (!secretKey || secretKey.includes('PASTE_YOUR')) {
      await supabase.from('webhook_logs').update({
        status: 'failed', error: 'PAYSTACK_SECRET_KEY not configured',
      }).eq('id', logId)
      return NextResponse.json({ received: true })
    }

    // REQUIREMENT 3: Verify webhook signature
    if (!signature) {
      await supabase.from('webhook_logs').update({
        status: 'failed', error: 'Missing x-paystack-signature header',
      }).eq('id', logId)
      return NextResponse.json({ received: true, error: 'Missing signature' }, { status: 401 })
    }

    const expectedSig = createHmac('sha512', secretKey).update(rawBody).digest('hex')
    if (signature !== expectedSig) {
      await supabase.from('webhook_logs').update({
        status: 'failed', error: 'Signature mismatch — possible fake request',
      }).eq('id', logId)
      return NextResponse.json({ received: true, error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event

    await supabase.from('webhook_logs').update({
      event: eventType,
      reference: event.data?.reference,
      payload: event,
    }).eq('id', logId)

    if (eventType !== 'charge.success') {
      await supabase.from('webhook_logs').update({
        status: 'skipped', error: 'Not a charge.success event',
        processed_at: new Date().toISOString(),
      }).eq('id', logId)
      return NextResponse.json({ received: true, processed: false })
    }

    const txData    = event.data
    const reference = txData.reference
    const amountPaid  = txData.amount / 100
    const currency    = txData.currency || 'NGN'
    const customerEmail = txData.customer?.email || null
    const customerName  = txData.metadata?.customer_name || txData.customer?.first_name || 'Customer'
    const paidAt      = txData.paid_at || new Date().toISOString()
    const channel     = txData.channel || 'unknown'

    // REQUIREMENT 9: Update log with reference
    await supabase.from('webhook_logs').update({
      reference,
      invoice_id: txData.metadata?.invoice_id || null,
    }).eq('id', logId)

    // IDEMPOTENCY: Do not process the same reference twice
    const { data: existingPayment } = await supabase
      .from('payments').select('id').eq('paystack_ref', reference).maybeSingle()

    if (existingPayment) {
      await supabase.from('webhook_logs').update({
        status: 'skipped', error: 'Already processed — idempotency check',
        processed_at: new Date().toISOString(),
      }).eq('id', logId)
      return NextResponse.json({ received: true, processed: false, reason: 'Already processed' })
    }

    // REQUIREMENT 4: Find invoice by metadata.invoice_id first, then fall back to paystack_reference
    let invoice: any = null

    const metaInvoiceId = txData.metadata?.invoice_id
    if (metaInvoiceId) {
      const { data } = await supabase
        .from('invoices')
        .select('id, workspace_id, status, invoice_number, customers(name,email)')
        .eq('id', metaInvoiceId)
        .maybeSingle()
      invoice = data
    }

    // Fallback: look up by the reference stored during initialization
    if (!invoice) {
      const { data } = await supabase
        .from('invoices')
        .select('id, workspace_id, status, invoice_number, customers(name,email)')
        .eq('paystack_reference', reference)
        .maybeSingle()
      invoice = data
    }

    if (!invoice) {
      await supabase.from('webhook_logs').update({
        status: 'failed',
        error: 'Invoice not found. metadata.invoice_id=' + metaInvoiceId + ' reference=' + reference,
        processed_at: new Date().toISOString(),
      }).eq('id', logId)
      return NextResponse.json({ received: true, processed: false, error: 'Invoice not found' })
    }

    if (invoice.status === 'PAID') {
      await supabase.from('webhook_logs').update({
        status: 'skipped', error: 'Invoice already paid',
        invoice_id: invoice.id, processed_at: new Date().toISOString(),
      }).eq('id', logId)
      return NextResponse.json({ received: true, processed: false, reason: 'Already paid' })
    }

    // REQUIREMENT 5 + 6: Update invoice status + store all payment details
    await supabase.from('invoices').update({
      status: 'PAID',
      paid_at: paidAt,
      payment_method: 'Paystack (' + channel + ')',
      paystack_ref: reference,
    }).eq('id', invoice.id)

    // REQUIREMENT 6: Write full payment record
    await supabase.from('payments').insert({
      workspace_id:   invoice.workspace_id,
      invoice_id:     invoice.id,
      amount:         amountPaid,
      currency,
      method:         'Paystack',
      payment_channel: channel,
      paystack_ref:   reference,
      customer_email: customerEmail,
      paid_at:        paidAt,
      status:         'SUCCESS',
    })

    // Notification for business owner
    await supabase.from('notifications').insert({
      workspace_id: invoice.workspace_id,
      title: 'Payment Received',
      description: 'Invoice ' + invoice.invoice_number + ' — ' + currency + ' ' + amountPaid.toLocaleString() + ' paid via Paystack (' + channel + ')',
      type: 'payment',
      read: false,
      link: '/dashboard/invoices/' + invoice.id,
    })

    // REQUIREMENT 8: Send payment confirmation email to customer
    const emailAddr = customerEmail || invoice.customers?.email
    if (emailAddr) {
      await sendConfirmationEmail(
        emailAddr,
        customerName || invoice.customers?.name || 'Customer',
        invoice.invoice_number,
        amountPaid,
        currency,
        'Business',
        reference,
        paidAt
      )
    }

    // REQUIREMENT 9: Mark log as processed
    await supabase.from('webhook_logs').update({
      status: 'processed',
      invoice_id: invoice.id,
      processed_at: new Date().toISOString(),
    }).eq('id', logId)

    return NextResponse.json({ received: true, processed: true })

  } catch (err: any) {
    console.error('Webhook error:', err)
    if (logId) {
      const supabase2 = getSupabase()
      await supabase2.from('webhook_logs').update({
        status: 'failed',
        error: err.message,
        processed_at: new Date().toISOString(),
      }).eq('id', logId)
    }
    return NextResponse.json({ received: true, error: err.message }, { status: 200 })
  }
}
