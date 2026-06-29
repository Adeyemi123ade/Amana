import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, logAdminAction } from '@/lib/admin-auth'
import { createClient as createAdminAuthClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createAdminAuthClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const db = getAdminSupabase()

  // Look up the pending invite
  const { data: invite, error } = await db
    .from('admin_invites')
    .select('email, display_name, role, expires_at')
    .eq('invite_token', token)
    .maybeSingle()

  if (error || !invite) {
    // Check if already accepted (exists in platform_admins with no token)
    return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
  }

  // Check expiry
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired. Please ask for a new one.' }, { status: 400 })
  }

  return NextResponse.json({
    email: invite.email,
    display_name: invite.display_name,
    role: invite.role,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { token, password, display_name } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const db = getAdminSupabase()

    // Validate token against admin_invites
    const { data: invite } = await db
      .from('admin_invites')
      .select('email, role, invited_by, display_name, expires_at')
      .eq('invite_token', token)
      .maybeSingle()

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired. Please ask for a new one.' }, { status: 400 })
    }

    // Check not already an active admin
    const { data: existingAdmin } = await db
      .from('platform_admins')
      .select('id')
      .eq('email', invite.email.toLowerCase())
      .maybeSingle()

    if (existingAdmin) {
      // Already activated — clean up invite and return success
      await db.from('admin_invites').delete().eq('invite_token', token)
      return NextResponse.json({ success: true, email: invite.email, alreadyActive: true })
    }

    const serviceClient = getServiceClient()

    // Check if Supabase Auth user already exists for this email
    const { data: existingUsers } = await serviceClient.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === invite.email.toLowerCase()
    )

    if (existingUser) {
      await serviceClient.auth.admin.updateUserById(existingUser.id, { password })
    } else {
      const { error: createError } = await serviceClient.auth.admin.createUser({
        email: invite.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: display_name || invite.display_name || invite.email,
          is_platform_admin: true,
        },
      })
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
    }

    // NOW create the platform_admins row — only on acceptance
    const finalName = display_name?.trim() || invite.display_name || null
    const { error: adminInsertError } = await db.from('platform_admins').insert({
      email: invite.email.toLowerCase(),
      display_name: finalName,
      role: invite.role,
      invited_by: invite.invited_by,
      active: true,
    })

    if (adminInsertError) {
      return NextResponse.json(
        { error: 'Account created but admin record failed: ' + adminInsertError.message },
        { status: 500 }
      )
    }

    // Delete the used invite
    await db.from('admin_invites').delete().eq('invite_token', token)

    await logAdminAction(invite.invited_by, 'ADMIN_INVITE_ACCEPTED', 'platform_admin', invite.email, { role: invite.role })

    return NextResponse.json({ success: true, email: invite.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
