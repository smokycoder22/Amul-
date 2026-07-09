import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('admin_session')?.value || null
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query(
      'SELECT id, username, expires_at FROM admin_login WHERE session_token = $1',
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const session = result.rows[0]

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }

    return NextResponse.json({ valid: true, username: session.username })
  } catch (error) {
    console.error('[v0] Session verification error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
