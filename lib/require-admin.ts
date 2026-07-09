import { cookies } from 'next/headers'
import { getAdminSession } from '@/lib/auth'

export async function requireAdmin() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session')?.value

  if (!sessionToken) {
    return null
  }
  try {
    const adminSession = await getAdminSession(sessionToken)

    if (!adminSession) {
      return null
    }

    return adminSession
  } catch (error) {
    console.error('[v0] requireAdmin auth error:', error)
    return null
  }
}