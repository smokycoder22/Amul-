import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { invalidateSession } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get('admin_session')
    if (adminCookie && adminCookie.value) {
      try {
        await invalidateSession(adminCookie.value, 'admin')
      } catch (e) {
        console.error('[v0] Failed to invalidate admin session on logout:', e)
      }
    }
    cookieStore.delete('admin_session')
    cookieStore.delete('distributor_session')
    
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('[v0] Error logging out:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
