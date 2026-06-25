import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function nextDueDate(current: string, frequency: string): string {
  const d = new Date(current)
  switch (frequency) {
    case 'WEEKLY':    d.setDate(d.getDate() + 7); break
    case 'MONTHLY':   d.setMonth(d.getMonth() + 1); break
    case 'QUARTERLY': d.setMonth(d.getMonth() + 3); break
    case 'YEARLY':    d.setFullYear(d.getFullYear() + 1); break
  }
  return d.toISOString().split('T')[0]
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const today = new Date().toISOString().split('T')[0]
    let generated = 0

    const { data: rules } = await supabase
      .from('recurring_invoices')
      .select('*, customers(*), workspaces(*)')
      .eq('active', true)
      .lte('next_due', today)

    for (const rule of rules || []) {
      // FIX: use DB function for safe, race-free invoice number generation
      const { data: nextNum } = await supabase
        .rpc('next_invoice_number', { p_workspace_id: rule.workspace_id })
      const invoiceNumber = nextNum || ('INV-' + Date.now())

      const dueDate = new Date(rule.next_due)
      dueDate.setDate(dueDate.getDate() + 14)

      const { error: invErr } = await supabase.from('invoices').insert({
        workspace_id: rule.workspace_id,
        customer_id: rule.customer_id,
        invoice_number: invoiceNumber,
        items: rule.items,
        total_amount: rule.total_amount,
        tax_rate: rule.tax_rate || 0,
        subtotal: rule.total_amount,
        issue_date: today,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'UNPAID',
        notes: rule.notes || null,
        payment_method: null,
      })

      if (!invErr) {
        await supabase.from('recurring_invoices').update({
          next_due: nextDueDate(rule.next_due, rule.frequency),
          last_generated: today,
        }).eq('id', rule.id)

        await supabase.from('notifications').insert({
          workspace_id: rule.workspace_id,
          title: 'Recurring Invoice Generated',
          description: `${invoiceNumber} for ${rule.customers?.name} — ${rule.title}`,
          type: 'invoice',
          read: false,
          link: '/dashboard/invoices',
        })

        generated++
      }
    }

    return NextResponse.json({ success: true, generated, ran_at: new Date().toISOString() })

  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}