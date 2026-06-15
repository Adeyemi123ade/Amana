import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { reference, invoiceId } = await request.json()

    if (!reference || !invoiceId) {
      return NextResponse.json({ error: 'Missing reference or invoiceId' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey || secretKey.includes('PASTE_YOUR')) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    // Verify transaction with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()

    if (!res.ok || !data.status || data.data?.status !== 'success') {
      return NextResponse.json({
        success: false,
        message: data.message || 'Payment verification failed',
      }, { status: 400 })
    }

    // Payment verified — update invoice in Supabase using service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.from('invoices').update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      payment_method: 'Paystack',
      paystack_reference: reference,
    }).eq('id', invoiceId)

    if (error) {
      return NextResponse.json({ error: 'Could not update invoice: ' + error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      amount: data.data.amount / 100,
      currency: data.data.currency,
      paidAt: data.data.paid_at,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
