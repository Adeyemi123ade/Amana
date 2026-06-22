import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role if available, fall back to anon (service role bypasses RLS)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const reference = body.reference
    let invoiceId = body.invoiceId || null

    if (!reference) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey || secretKey.includes('PASTE_YOUR')) {
      return NextResponse.json({ error: 'Paystack not configured on this server' }, { status: 500 })
    }

    const supabase = getSupabase()

    // ── IDEMPOTENCY CHECK ─────────────────────────────────
    // If this reference already exists in payments table, do not process again
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('paystack_ref', reference)
      .maybeSingle()

    if (existingPayment) {
      // Already processed — return success so the UI updates correctly
      return NextResponse.json({
        success: true,
        message: 'Payment already recorded',
        alreadyProcessed: true,
      })
    }

    // ── LOOK UP invoiceId FROM paystack_reference COLUMN if not provided ──
    // This handles the case where Paystack callback to /payment/verify
    // does not include invoiceId in the URL — we find the invoice by reference
    if (!invoiceId) {
      const { data: invByRef } = await supabase
        .from('invoices')
        .select('id')
        .eq('paystack_reference', reference)
        .maybeSingle()
      if (invByRef) {
        invoiceId = invByRef.id
      }
    }

    // If still no invoiceId, the reference might not match any stored invoice
    // This can happen if paystack_reference was not stored at init time
    // We still proceed — the invoice update below will just be skipped
    if (!invoiceId) {
      console.warn('paystack-verify: no invoiceId found for reference', reference)
    }

    // ── VERIFY WITH PAYSTACK ──────────────────────────────
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const paystackData = await paystackRes.json()

    if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== 'success') {
      return NextResponse.json({
        success: false,
        message: paystackData.message || 'Payment verification failed. Please contact support.',
      }, { status: 400 })
    }

    const txData = paystackData.data
    const amountPaid = txData.amount / 100  // convert kobo to naira
    const currency = txData.currency || 'NGN'
    const customerEmail = txData.customer?.email || null
    const paidAt = txData.paid_at || new Date().toISOString()

    // ── FETCH INVOICE to get workspace_id ────────────────
    let invoice: any = null
    if (invoiceId) {
      const { data: invData } = await supabase
        .from('invoices')
        .select('id, workspace_id, status, total_amount, invoice_number')
        .eq('id', invoiceId)
        .maybeSingle()
      invoice = invData
    }

    // If no invoice found, payment was received but can't be matched to an invoice
    // Webhook will handle it via metadata.invoice_id — still return success so UI doesn't alarm customer
    if (!invoice) {
      console.warn('paystack-verify: invoice not found for invoiceId', invoiceId, 'reference', reference)
      return NextResponse.json({
        success: true,
        message: 'Payment received. Our system will update your invoice shortly.',
        pendingMatch: true,
      })
    }

    // ── BLOCK DOUBLE PAYMENT ──────────────────────────────
    if (invoice.status === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Invoice already marked as paid.',
        alreadyPaid: true,
      })
    }

    // ── UPDATE INVOICE ────────────────────────────────────
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        status: 'PAID',
        paid_at: paidAt,
        payment_method: 'Paystack',
        paystack_ref: reference,        // correct column name
      })
      .eq('id', invoiceId)

    if (invoiceError) {
      console.error('Invoice update failed:', invoiceError)
      return NextResponse.json({
        error: 'Payment verified but invoice update failed: ' + invoiceError.message,
      }, { status: 500 })
    }

    // ── WRITE PAYMENT RECORD ──────────────────────────────
    // This is what makes the Payments page and Reports work
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        workspace_id: invoice.workspace_id,
        invoice_id: invoiceId,
        amount: amountPaid,
        currency,
        method: 'Paystack',
        paystack_ref: reference,
        customer_email: customerEmail,
        status: 'SUCCESS',
      })

    if (paymentError) {
      // Payment record failed — log it but do not fail the whole request
      // Invoice is already marked PAID which is the critical part
      console.error('Payment record insert failed:', paymentError)
    }

    // ── CREATE NOTIFICATION for business owner ───────────
    await supabase
      .from('notifications')
      .insert({
        workspace_id: invoice.workspace_id,
        title: 'Payment Received',
        description: `Invoice ${invoice.invoice_number} — ${currency} ${amountPaid.toLocaleString()} received via Paystack`,
        type: 'payment',
        read: false,
        link: `/dashboard/invoices/${invoiceId}`,
      })
      .then(({ error }) => {
        if (error) console.error('Notification insert failed:', error)
      })

    // ── REQUIREMENT 8: Send payment confirmation email ──
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && !resendKey.includes('PASTE_YOUR') && customerEmail) {
      const date = new Date(paidAt).toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' })
      const custName = txData.customer?.first_name || txData.metadata?.customer_name || 'Customer'
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Amana Help Desk <noreply@chichatapp.com>',
          to: [customerEmail],
          subject: `Payment Confirmed — ${invoice.invoice_number}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;text-align:center;width:100%">
  <tr><td style="text-align:center;padding-bottom:16px;">
    <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
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
    <span style="font-size:18px;font-weight:800;color:#0E1A6E;vertical-align:middle;margin-left:10px;font-family:Arial,sans-serif;">Amana</span>
  </td></tr>
</table>
            <h2 style="color:#15803D">✓ Payment Confirmed</h2>
            <p>Hello ${custName},</p>
            <p>Your payment of <strong>${currency} ${amountPaid.toLocaleString()}</strong> for invoice <strong>${invoice.invoice_number}</strong> has been received.</p>
            <p>Date: ${date}<br/>Reference: ${reference}</p>
            <p>Please keep this email as your receipt. Thank you for your payment.</p>
          </div>`,
        }),
      }).catch(e => console.error('Confirmation email failed:', e))
    }

    return NextResponse.json({
      success: true,
      amount: amountPaid,
      currency,
      paidAt,
      invoiceNumber: invoice.invoice_number,
    })

  } catch (err: any) {
    console.error('Paystack verify error:', err)
    return NextResponse.json({
      error: err.message || 'An unexpected server error occurred',
    }, { status: 500 })
  }
}
