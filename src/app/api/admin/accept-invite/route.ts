import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-auth'
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
  const { data: admin, error } = await db
    .from('platform_admins')
    .select('email, display_name, role, active, invite_token')
    .eq('invite_token', token)
    .maybeSingle()

  if (error || !admin) return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
  if (admin.active) return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 })

  return NextResponse.json({
    email: admin.email,
    display_name: admin.display_name,
    role: admin.role,
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

    // Validate token
    const { data: admin } = await db
      .from('platform_admins')
      .select('email, role, active, invite_token')
      .eq('invite_token', token)
      .maybeSingle()

    if (!admin) return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    if (admin.active) return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 })

    const serviceClient = getServiceClient()

    // Check if Supabase Auth user already exists for this email
    const { data: existingUsers } = await serviceClient.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === admin.email.toLowerCase()
    )

    if (existingUser) {
      // User exists — just activate them and update password
      await serviceClient.auth.admin.updateUserById(existingUser.id, { password })
    } else {
      // Create new Supabase Auth user
      const { error: createError } = await serviceClient.auth.admin.createUser({
        email: admin.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: display_name || admin.email,
          is_platform_admin: true,
        },
      })
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
    }

    // Mark admin as active, clear token, save display name
    const updatePayload: any = {
      active: true,
      invite_token: null,
    }
    if (display_name?.trim()) updatePayload.display_name = display_name.trim()

    const { error: updateError } = await db
      .from('platform_admins')
      .update(updatePayload)
      .eq('email', admin.email.toLowerCase())

    if (updateError) {
      return NextResponse.json({ error: 'Account created but profile update failed: ' + updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, email: admin.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}