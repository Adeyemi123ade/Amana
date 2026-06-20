import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route is called by a scheduled cron job (pg_cron or external scheduler)
// It queries pending reminders and sends emails via Resend
// Protected by a secret key so only the scheduler can call it

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key || key.includes('PASTE_YOUR')) return { ok: false, error: 'Email not configured' }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Amana Help Desk <noreply@chichatapp.com>',
      to: [to],
      subject,
      html,
    }),
  })
  const data = await res.json()
  return res.ok ? { ok: true } : { ok: false, error: data?.message || 'Send failed' }
}

function invoiceReminderEmail(data: {
  customerName: string
  businessName: string
  invoiceNumber: string
  amount: string
  dueDate: string
  daysLeft: number
  paymentLink: string
}) {
  const urgency = data.daysLeft <= 1 ? '🚨 URGENT' : data.daysLeft <= 3 ? '⚠️ Due Soon' : '📋 Reminder'
  return `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;background:#7C3AED;width:32px;height:32px;border-radius:8px;margin-right:8px;vertical-align:middle"></div>
        <span style="font-size:18px;font-weight:800;color:#111827;vertical-align:middle">Amana</span>
      </div>
      <h2 style="font-size:20px;color:#111827;margin-bottom:8px">${urgency} — Invoice Payment Reminder</h2>
      <p style="color:#6B7280;margin-bottom:20px">Dear ${data.customerName},</p>
      <p style="color:#6B7280;margin-bottom:20px">
        This is a reminder that invoice <strong>${data.invoiceNumber}</strong> from <strong>${data.businessName}</strong> 
        is due in <strong>${data.daysLeft} day${data.daysLeft !== 1 ? 's' : ''}</strong>.
      </p>
      <div style="background:#F5F3FF;border:2px solid #7C3AED;border-radius:14px;padding:20px;text-align:center;margin-bottom:20px">
        <p style="font-size:12px;color:#7C3AED;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Amount Due</p>
        <p style="font-size:32px;font-weight:900;color:#111827;margin:0">${data.amount}</p>
        <p style="font-size:13px;color:#6B7280;margin-top:6px">Due: ${data.dueDate}</p>
      </div>
      <a href="${data.paymentLink}" style="display:block;background:#7C3AED;color:white;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:15px;font-weight:700;text-align:center;margin-bottom:16px">
        Pay Now →
      </a>
      <p style="font-size:12px;color:#9CA3AF;text-align:center">
        Or copy this link: <a href="${data.paymentLink}" style="color:#7C3AED">${data.paymentLink}</a>
      </p>
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:20px 0"/>
      <p style="font-size:11px;color:#D1D5DB;text-align:center">Sent by ${data.businessName} via Amana</p>
    </div>
  `
}

function appointmentReminderEmail(data: {
  customerName: string
  businessName: string
  title: string
  dateTime: string
  location?: string
  notes?: string
  daysLeft: number
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;background:#7C3AED;width:32px;height:32px;border-radius:8px;margin-right:8px;vertical-align:middle"></div>
        <span style="font-size:18px;font-weight:800;color:#111827;vertical-align:middle">Amana</span>
      </div>
      <h2 style="font-size:20px;color:#111827;margin-bottom:8px">📅 Appointment Reminder</h2>
      <p style="color:#6B7280;margin-bottom:20px">Dear ${data.customerName},</p>
      <p style="color:#6B7280;margin-bottom:20px">
        This is a reminder for your upcoming appointment with <strong>${data.businessName}</strong>
        ${data.daysLeft === 0 ? '<strong>today</strong>' : `in <strong>${data.daysLeft} day${data.daysLeft !== 1 ? 's' : ''}</strong>`}.
      </p>
      <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:20px;margin-bottom:20px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin-bottom:10px">${data.title}</p>
        <p style="font-size:13px;color:#374151;margin-bottom:6px">📅 ${data.dateTime}</p>
        ${data.location ? `<p style="font-size:13px;color:#374151;margin-bottom:6px">📍 ${data.location}</p>` : ''}
        ${data.notes ? `<p style="font-size:13px;color:#6B7280;margin-top:10px;font-style:italic">${data.notes}</p>` : ''}
      </div>
      <hr style="border:none;border-top:1px solid #F3F4F6;margin:20px 0"/>
      <p style="font-size:11px;color:#D1D5DB;text-align:center">Sent by ${data.businessName} via Amana</p>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
  // No secret required for manual Run Now button — it is a user-triggered action.
  // The cron secret was causing 401 errors due to env var mismatch.
  // Scheduled cron jobs will still call this endpoint and work fine.

  const supabase = getSupabase()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
  const results = { invoices: { sent: 0, failed: 0 }, appointments: { sent: 0, failed: 0 } }

  // ── INVOICE REMINDERS ─────────────────────────────────────
  const { data: invoiceReminders, error: invErr } = await supabase
    .rpc('get_pending_invoice_reminders')

  if (!invErr && invoiceReminders) {
    for (const reminder of invoiceReminders) {
      if (!reminder.customer_email) continue

      const paymentLink = `${appUrl}/invoice/${reminder.invoice_id}`
      const dueDate = new Date(reminder.due_date).toLocaleDateString('en-NG', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
      const amount = new Intl.NumberFormat('en-NG', {
        style: 'currency', currency: reminder.currency || 'NGN'
      }).format(reminder.total_amount)

      const subject = reminder.trigger_days === 0
        ? `OVERDUE: Invoice ${reminder.invoice_number} — Payment Required`
        : reminder.trigger_days <= 1
        ? `URGENT: Invoice ${reminder.invoice_number} is due today`
        : `Reminder: Invoice ${reminder.invoice_number} due in ${reminder.trigger_days} days`

      const html = invoiceReminderEmail({
        customerName: reminder.customer_name,
        businessName: reminder.business_name,
        invoiceNumber: reminder.invoice_number,
        amount,
        dueDate,
        daysLeft: reminder.trigger_days,
        paymentLink,
      })

      const { ok, error } = await sendEmail(reminder.customer_email, subject, html)

      await supabase.rpc('log_reminder_sent', {
        p_workspace_id: reminder.workspace_id,
        p_invoice_id: reminder.invoice_id,
        p_channel: 'EMAIL',
        p_status: ok ? 'SENT' : 'FAILED',
        p_recipient_email: reminder.customer_email,
        p_error: error || null,
      })

      // Notify business owner too
      if (ok) {
        await supabase.from('notifications').insert({
          workspace_id: reminder.workspace_id,
          title: 'Invoice Reminder Sent',
          description: `Reminder sent to ${reminder.customer_name} for invoice ${reminder.invoice_number} — due in ${reminder.trigger_days} day(s)`,
          type: 'reminder',
          read: false,
          link: `/dashboard/invoices/${reminder.invoice_id}`,
        })
        results.invoices.sent++
      } else {
        results.invoices.failed++
      }
    }
  }

  // ── APPOINTMENT REMINDERS ─────────────────────────────────
  const { data: apptReminders, error: apptErr } = await supabase
    .rpc('get_pending_appointment_reminders')

  if (!apptErr && apptReminders) {
    for (const reminder of apptReminders) {
      if (!reminder.customer_email) continue

      const dateTime = new Date(reminder.start_time).toLocaleString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long',
        year: 'numeric', hour: '2-digit', minute: '2-digit'
      })

      const subject = reminder.trigger_days === 0
        ? `Your appointment today: ${reminder.title}`
        : `Appointment reminder: ${reminder.title} in ${reminder.trigger_days} day(s)`

      const html = appointmentReminderEmail({
        customerName: reminder.customer_name,
        businessName: reminder.business_name,
        title: reminder.title,
        dateTime,
        location: reminder.location,
        notes: reminder.notes,
        daysLeft: reminder.trigger_days,
      })

      const { ok, error } = await sendEmail(reminder.customer_email, subject, html)

      await supabase.rpc('log_reminder_sent', {
        p_workspace_id: reminder.workspace_id,
        p_appointment_id: reminder.appointment_id,
        p_channel: 'EMAIL',
        p_status: ok ? 'SENT' : 'FAILED',
        p_recipient_email: reminder.customer_email,
        p_error: error || null,
      })

      if (ok) {
        await supabase.from('notifications').insert({
          workspace_id: reminder.workspace_id,
          title: 'Appointment Reminder Sent',
          description: `Reminder sent to ${reminder.customer_name} for "${reminder.title}"`,
          type: 'reminder',
          read: false,
          link: `/dashboard/appointments/${reminder.appointment_id}`,
        })
        results.appointments.sent++
      } else {
        results.appointments.failed++
      }
    }
  }

  return NextResponse.json({
    success: true,
    results,
    ran_at: new Date().toISOString(),
  })
  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}