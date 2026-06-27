import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const db = getAdminSupabase()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = db
      .from('tenant_billing')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (status && status !== 'ALL') query = query.eq('status', status)
    if (search) {
      query = query.or(
        `business_name.ilike.%${search}%,invoice_number.ilike.%${search}%,business_email.ilike.%${search}%,owner_name.ilike.%${search}%`
      )
    }

    const { data: invoices, error } = await query
    if (error) throw error

    // Compute summary stats
    const all = invoices || []
    const stats = {
      total: all.length,
      paid: all.filter(i => i.status === 'PAID').length,
      pending: all.filter(i => i.status === 'PENDING').length,
      overdue: all.filter(i => i.status === 'OVERDUE').length,
      failed: all.filter(i => i.status === 'FAILED').length,
      cancelled: all.filter(i => i.status === 'CANCELLED').length,
      waived: all.filter(i => i.status === 'WAIVED').length,
      totalExpected: all.reduce((s, i) => s + Number(i.invoice_amount), 0),
      totalCollected: all.reduce((s, i) => s + Number(i.amount_paid), 0),
      totalOutstanding: all.reduce((s, i) => s + Number(i.outstanding_balance || 0), 0),
      activeSubscriptions: all.filter(i => i.subscription_status === 'ACTIVE').length,
      trialAccounts: all.filter(i => i.subscription_status === 'TRIAL').length,
    }

    return NextResponse.json({ invoices: all, stats })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()
    const { action, id, ...payload } = body
    const db = getAdminSupabase()

    const log = async (a: string, details: object = {}) => {
      await db.from('tenant_billing_logs').insert({
        billing_id: id,
        admin_email: user.email,
        action: a,
        details,
      })
    }

    if (action === 'CREATE') {
      // Auto-generate invoice number
      const { count } = await db.from('tenant_billing').select('*', { count: 'exact', head: true })
      const num = String((count || 0) + 1).padStart(4, '0')
      const invoice_number = `AMN-${new Date().getFullYear()}-${num}`

      const { data, error } = await db.from('tenant_billing').insert({
        ...payload,
        invoice_number,
        status: 'DRAFT',
      }).select().single()
      if (error) throw error
      await log('INVOICE_CREATED', { invoice_number })
      return NextResponse.json({ success: true, invoice: data })
    }

    if (action === 'MARK_PAID') {
      await db.from('tenant_billing').update({
        status: 'PAID',
        amount_paid: payload.amount,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      await log('MARKED_PAID', { amount: payload.amount })
      return NextResponse.json({ success: true })
    }

    if (action === 'MARK_OVERDUE') {
      await db.from('tenant_billing').update({ status: 'OVERDUE', updated_at: new Date().toISOString() }).eq('id', id)
      await log('MARKED_OVERDUE')
      return NextResponse.json({ success: true })
    }

    if (action === 'WAIVE') {
      await db.from('tenant_billing').update({
        status: 'WAIVED',
        waived_by: user.email,
        waived_reason: payload.reason || '',
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      await log('INVOICE_WAIVED', { reason: payload.reason })
      return NextResponse.json({ success: true })
    }

    if (action === 'CANCEL') {
      await db.from('tenant_billing').update({ status: 'CANCELLED', updated_at: new Date().toISOString() }).eq('id', id)
      await log('INVOICE_CANCELLED')
      return NextResponse.json({ success: true })
    }

    if (action === 'SEND_REMINDER') {
      await db.from('tenant_billing').update({ last_reminder_at: new Date().toISOString(), status: 'SENT', updated_at: new Date().toISOString() }).eq('id', id)
      await log('REMINDER_SENT')
      return NextResponse.json({ success: true })
    }

    if (action === 'ADD_NOTE') {
      await db.from('tenant_billing').update({ admin_notes: payload.note, updated_at: new Date().toISOString() }).eq('id', id)
      await log('NOTE_ADDED', { note: payload.note })
      return NextResponse.json({ success: true })
    }

    if (action === 'APPLY_DISCOUNT') {
      await db.from('tenant_billing').update({
        discount_amount: payload.discount,
        invoice_amount: payload.newAmount,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      await log('DISCOUNT_APPLIED', { discount: payload.discount })
      return NextResponse.json({ success: true })
    }

    if (action === 'UPDATE_STATUS') {
      await db.from('tenant_billing').update({ status: payload.status, updated_at: new Date().toISOString() }).eq('id', id)
      await log('STATUS_UPDATED', { status: payload.status })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
