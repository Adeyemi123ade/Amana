import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'

// Send invoice email via Resend
async function sendInvoiceEmail(inv: any, adminEmail: string) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey.includes('PASTE_YOUR')) return { ok: false, error: 'Email not configured' }

  const dueDate = inv.due_date
    ? new Date(inv.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not specified'

  const billingLink = `${APP_URL}/dashboard/billing`
  const cur = inv.currency === 'NGN' ? '₦' : '$'
  const amount = cur + Number(inv.invoice_amount).toLocaleString()

  const html = `
<div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;padding:24px;background:#FFFFFF">
  <div style="text-align:center;margin-bottom:28px">
    <div style="display:inline-flex;align-items:center;gap:10px">
      <div style="width:40px;height:40px;background:#0E1A6E;border-radius:10px;display:inline-flex;align-items:center;justify-content:center">
        <table cellpadding="0" cellspacing="3" border="0" style="margin:0 auto">
          <tr><td style="background:white;width:9px;height:9px;border-radius:2px"></td><td style="background:white;width:9px;height:9px;border-radius:2px"></td></tr>
          <tr><td style="background:white;width:9px;height:9px;border-radius:2px"></td><td style="background:white;width:9px;height:9px;border-radius:2px"></td></tr>
        </table>
      </div>
      <span style="font-size:22px;font-weight:800;color:#0F172A">Amana</span>
    </div>
  </div>

  <div style="background:#F8FAFC;border-radius:12px;padding:20px 24px;margin-bottom:20px;border-left:4px solid #0E1A6E">
    <p style="font-size:13px;color:#64748B;margin:0 0 4px">PLATFORM INVOICE</p>
    <p style="font-size:22px;font-weight:800;color:#0F172A;margin:0">${inv.invoice_number}</p>
  </div>

  <p style="font-size:15px;color:#374151;margin-bottom:20px">
    Dear <strong>${inv.owner_name || inv.business_name}</strong>,
  </p>
  <p style="font-size:14px;color:#4B5563;line-height:1.6;margin-bottom:20px">
    Please find attached your Amana platform invoice for <strong>${inv.plan_name}</strong> subscription
    ${inv.billing_period_start ? `(${new Date(inv.billing_period_start).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })} – ${new Date(inv.billing_period_end).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })})` : ''}.
  </p>

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F1F5F9;border-radius:10px;padding:16px 20px;margin-bottom:20px">
    <tr><td style="font-size:12px;color:#64748B;padding:6px 0;border-bottom:1px solid #E2E8F0">Business</td><td style="font-size:13px;font-weight:600;color:#0F172A;text-align:right;padding:6px 0;border-bottom:1px solid #E2E8F0">${inv.business_name}</td></tr>
    <tr><td style="font-size:12px;color:#64748B;padding:6px 0;border-bottom:1px solid #E2E8F0">Plan</td><td style="font-size:13px;font-weight:600;color:#0F172A;text-align:right;padding:6px 0;border-bottom:1px solid #E2E8F0">${inv.plan_name} (${inv.billing_type})</td></tr>
    <tr><td style="font-size:12px;color:#64748B;padding:6px 0;border-bottom:1px solid #E2E8F0">Invoice Amount</td><td style="font-size:15px;font-weight:800;color:#0E1A6E;text-align:right;padding:6px 0;border-bottom:1px solid #E2E8F0">${amount}</td></tr>
    <tr><td style="font-size:12px;color:#64748B;padding:6px 0">Due Date</td><td style="font-size:13px;font-weight:700;color:#DC2626;text-align:right;padding:6px 0">${dueDate}</td></tr>
  </table>

  <p style="font-size:13px;color:#4B5563;line-height:1.6;margin-bottom:24px">
    Please log in to your Amana dashboard to review and pay this invoice before the due date to avoid service interruption.
  </p>

  <div style="text-align:center;margin-bottom:24px">
    <a href="${billingLink}" style="display:inline-block;background:#0E1A6E;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700">
      View & Pay Invoice
    </a>
  </div>

  <div style="background:#FEF2F2;border-radius:8px;padding:12px 16px;margin-bottom:20px">
    <p style="font-size:12px;color:#DC2626;margin:0;font-weight:600">⚠️ Payment Reminder</p>
    <p style="font-size:12px;color:#7F1D1D;margin:4px 0 0">Failure to pay by ${dueDate} may result in service restriction.</p>
  </div>

  <p style="font-size:11px;color:#94A3B8;text-align:center;margin-top:24px">
    This is a platform billing invoice from Amana. It is not related to invoices you send to your own customers.<br/>
    Sent by: ${adminEmail} · Amana Platform Billing
  </p>
</div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Amana Billing <noreply@chichatapp.com>',
      to: [inv.business_email],
      subject: `Platform Invoice ${inv.invoice_number} — ${inv.plan_name} Subscription`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { ok: false, error: err.message || 'Email send failed' }
  }
  return { ok: true }
}

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
      }).catch(() => {})
    }

    if (action === 'CREATE') {
      const { count } = await db.from('tenant_billing').select('*', { count: 'exact', head: true })
      const num = String((count || 0) + 1).padStart(4, '0')
      const invoice_number = `AMN-${new Date().getFullYear()}-${num}`
      const { data, error } = await db.from('tenant_billing').insert({
        ...payload,
        invoice_number,
        status: 'DRAFT',
        delivery_status: 'NOT_SENT',
      }).select().single()
      if (error) throw error
      await log('INVOICE_CREATED', { invoice_number })
      return NextResponse.json({ success: true, invoice: data })
    }

    if (action === 'SEND_INVOICE') {
      // Get invoice details
      const { data: inv, error: fetchErr } = await db.from('tenant_billing').select('*').eq('id', id).single()
      if (fetchErr || !inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      if (!inv.business_email) return NextResponse.json({ error: 'Invoice has no business email address' }, { status: 400 })

      // 1. Send email via Resend
      const emailResult = await sendInvoiceEmail(inv, user.email!)

      // 2. Insert in-app notification to business notifications table
      // We look up the workspace by business email to find workspace_id
      const { data: workspace } = await db
        .from('workspaces')
        .select('id')
        .eq('business_email', inv.business_email)
        .maybeSingle()

      // Also try matching by created_by user email
      let wsId = workspace?.id
      if (!wsId && inv.workspace_id) wsId = inv.workspace_id

      if (wsId) {
        const dueDate = inv.due_date
          ? new Date(inv.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'soon'

        await db.from('notifications').insert({
          workspace_id: wsId,
          title: `New Platform Invoice: ${inv.invoice_number}`,
          description: `Amana has issued an invoice for your ${inv.plan_name} subscription. Amount: ${inv.currency === 'NGN' ? '₦' : '$'}${Number(inv.invoice_amount).toLocaleString()}. Please pay before ${dueDate} to avoid service interruption.`,
          type: 'billing',
          read: false,
          link: '/dashboard/billing',
        }).catch(() => {}) // Don't fail if notification insert fails
      }

      // 3. Update invoice status and delivery tracking
      const now = new Date().toISOString()
      await db.from('tenant_billing').update({
        status: 'SENT',
        sent_at: now,
        delivery_status: emailResult.ok ? 'SENT' : 'FAILED',
        recipient_email: inv.business_email,
        updated_at: now,
      }).eq('id', id)

      await log('INVOICE_SENT', {
        email: inv.business_email,
        delivery: emailResult.ok ? 'SENT' : 'FAILED',
        error: emailResult.ok ? undefined : emailResult.error,
        notification_sent: !!wsId,
      })

      return NextResponse.json({
        success: true,
        emailSent: emailResult.ok,
        notificationSent: !!wsId,
        emailError: emailResult.ok ? null : emailResult.error,
      })
    }

    if (action === 'SEND_REMINDER') {
      const { data: inv } = await db.from('tenant_billing').select('*').eq('id', id).single()
      if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

      // Send reminder email
      const emailResult = await sendInvoiceEmail(inv, user.email!)

      // In-app reminder notification
      const wsId = inv.workspace_id
      if (wsId) {
        const dueDate = inv.due_date
          ? new Date(inv.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'soon'
        await db.from('notifications').insert({
          workspace_id: wsId,
          title: `Payment Reminder: ${inv.invoice_number}`,
          description: `This is a reminder to pay your Amana platform invoice of ${inv.currency === 'NGN' ? '₦' : '$'}${Number(inv.invoice_amount).toLocaleString()} before ${dueDate}.`,
          type: 'billing',
          read: false,
          link: '/dashboard/billing',
        }).catch(() => {})
      }

      await db.from('tenant_billing').update({
        last_reminder_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', id)

      await log('REMINDER_SENT', { email: inv?.business_email, delivery: emailResult.ok ? 'SENT' : 'FAILED' })
      return NextResponse.json({ success: true, emailSent: emailResult.ok })
    }

    if (action === 'MARK_PAID') {
      const now = new Date().toISOString()
      await db.from('tenant_billing').update({
        status: 'PAID',
        amount_paid: payload.amount,
        paid_at: now,
        delivery_status: 'PAID',
        updated_at: now,
      }).eq('id', id)
      await log('MARKED_PAID', { amount: payload.amount, confirmed_by: user.email })
      return NextResponse.json({ success: true })
    }

    if (action === 'MARK_OVERDUE') {
      await db.from('tenant_billing').update({ status: 'OVERDUE', updated_at: new Date().toISOString() }).eq('id', id)
      const { data: inv } = await db.from('tenant_billing').select('workspace_id,invoice_number,invoice_amount,currency,due_date').eq('id', id).single()
      if (inv?.workspace_id) {
        await db.from('notifications').insert({
          workspace_id: inv.workspace_id,
          title: `Overdue Invoice: ${inv.invoice_number}`,
          description: `Your Amana platform invoice is now overdue. Please pay ${inv.currency === 'NGN' ? '₦' : '$'}${Number(inv.invoice_amount).toLocaleString()} immediately to avoid service interruption.`,
          type: 'billing',
          read: false,
          link: '/dashboard/billing',
        }).catch(() => {})
      }
      await log('MARKED_OVERDUE')
      return NextResponse.json({ success: true })
    }

    if (action === 'WAIVE') {
      await db.from('tenant_billing').update({
        status: 'WAIVED', waived_by: user.email,
        waived_reason: payload.reason || '', updated_at: new Date().toISOString(),
      }).eq('id', id)
      await log('INVOICE_WAIVED', { reason: payload.reason })
      return NextResponse.json({ success: true })
    }

    if (action === 'CANCEL') {
      await db.from('tenant_billing').update({ status: 'CANCELLED', updated_at: new Date().toISOString() }).eq('id', id)
      await log('INVOICE_CANCELLED')
      return NextResponse.json({ success: true })
    }

    if (action === 'ADD_NOTE') {
      await db.from('tenant_billing').update({ admin_notes: payload.note, updated_at: new Date().toISOString() }).eq('id', id)
      await log('NOTE_ADDED', { note: payload.note })
      return NextResponse.json({ success: true })
    }

    if (action === 'APPLY_DISCOUNT') {
      await db.from('tenant_billing').update({
        discount_amount: payload.discount, invoice_amount: payload.newAmount,
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
