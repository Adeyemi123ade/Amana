import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function toCSV(rows: Record<string, any>[], columns: string[]): string {
  const header = columns.join(',')
  const body = rows.map(row =>
    columns.map(col => {
      const v = row[col] ?? ''
      const s = String(v).replace(/"/g, '""')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
    }).join(',')
  ).join('\n')
  return header + '\n' + body
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')      // customers | invoices | payments
  const wsId = searchParams.get('workspace')

  if (!wsId || !type) return NextResponse.json({ error: 'Missing workspace or type' }, { status: 400 })

  const supabase = getSupabase()
  let csv = ''
  let filename = ''

  if (type === 'customers') {
    const { data } = await supabase
      .from('customers')
      .select('name, email, phone, address, total_spent, created_at')
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false })

    csv = toCSV(data || [], ['name','email','phone','address','total_spent','created_at'])
    filename = 'amana-customers.csv'

  } else if (type === 'invoices') {
    const { data } = await supabase
      .from('invoices')
      .select('invoice_number, status, total_amount, issue_date, due_date, paid_at, payment_method, customers(name, email)')
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false })

    const rows = (data || []).map((inv: any) => ({
      invoice_number: inv.invoice_number,
      customer_name: inv.customers?.name || '',
      customer_email: inv.customers?.email || '',
      status: inv.status,
      total_amount: inv.total_amount,
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      paid_at: inv.paid_at || '',
      payment_method: inv.payment_method || '',
    }))

    csv = toCSV(rows, ['invoice_number','customer_name','customer_email','status','total_amount','issue_date','due_date','paid_at','payment_method'])
    filename = 'amana-invoices.csv'

  } else if (type === 'payments') {
    const { data } = await supabase
      .from('payments')
      .select('amount, currency, method, customer_email, status, created_at, paystack_ref, invoices(invoice_number)')
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false })

    const rows = (data || []).map((p: any) => ({
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      customer_email: p.customer_email || '',
      invoice_number: (p.invoices as any)?.invoice_number || '',
      status: p.status,
      paystack_ref: p.paystack_ref || '',
      date: p.created_at,
    }))

    csv = toCSV(rows, ['amount','currency','method','customer_email','invoice_number','status','paystack_ref','date'])
    filename = 'amana-payments.csv'

  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  return new NextResponse('\uFEFF' + csv, {  // BOM for Excel UTF-8
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  })
}
