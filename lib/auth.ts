import { query } from './db'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Generate a random OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Create or update distributor OTP session
export async function createDistributorOTP(phoneNumber: string) {
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  try {
    // For MVP, we'll use OTP "1111" in development
    const devOtp = process.env.NODE_ENV === 'development' ? '1111' : otp
    
    await query(
      `INSERT INTO distributor_sessions (phone_number, otp_code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (phone_number) 
       DO UPDATE SET otp_code = $2, expires_at = $3, verified_at = NULL`,
      [phoneNumber, devOtp, expiresAt]
    )
    
    console.log('[v0] OTP created for phone:', phoneNumber, 'OTP:', devOtp)
    return { success: true, otp: devOtp }
  } catch (error) {
    console.error('[v0] Error creating OTP:', error)
    throw error
  }
}

// Verify OTP and create session
export async function verifyDistributorOTP(
  phoneNumber: string,
  otp: string
): Promise<string | null> {
  try {
    const result = await query(
      `SELECT * FROM distributor_sessions 
       WHERE phone_number = $1 
       AND otp_code = $2 
       AND expires_at > NOW()`,
      [phoneNumber, otp]
    )
    
    if (result.rows.length === 0) {
      console.log('[v0] OTP verification failed for phone:', phoneNumber)
      return null
    }
    
    // Create session token
    const sessionToken = generateSessionToken()
    const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    await query(
      `UPDATE distributor_sessions 
       SET session_token = $1, verified_at = NOW(), expires_at = $2
       WHERE phone_number = $3`,
      [sessionToken, sessionExpiresAt, phoneNumber]
    )
    
    console.log('[v0] OTP verified, session token created for phone:', phoneNumber)
    return sessionToken
  } catch (error) {
    console.error('[v0] Error verifying OTP:', error)
    throw error
  }
}

// Get distributor session by token
export async function getDistributorSession(sessionToken: string) {
  try {
    const result = await query(
      `SELECT phone_number FROM distributor_sessions 
       WHERE session_token = $1 
       AND expires_at > NOW()`,
      [sessionToken]
    )
    
    return result.rows[0] || null
  } catch (error) {
    console.error('[v0] Error getting distributor session:', error)
    throw error
  }
}

// Create admin session (after password verification)
export async function createAdminSession(
  username: string,
  password: string
): Promise<string | null> {
  const envAdminId = process.env.ADMIN_ID
  const envAdminPassword = process.env.ADMIN_PASSWORD
  // Log presence of env vars (do NOT log values).
  try {
    console.log('[v0] createAdminSession env presence', {
      hasAdminId: Boolean(envAdminId),
      hasAdminPassword: Boolean(envAdminPassword),
    })
  } catch (e) {
    // ignore logging errors
  }

  // Require credentials to be provided via environment variables.
  if (!envAdminId || !envAdminPassword) {
    console.warn('[v0] ADMIN_ID or ADMIN_PASSWORD not configured; rejecting login')
    return null
  }

  // Only accept username/password that match env values
  if (username !== envAdminId || password !== envAdminPassword) {
    return null
  }

  // Create a session in the database. If DB write fails, do NOT return a mock token.
  let sessionToken: string | null = null
  let sessionExpiresAt: Date | null = null

  try {
    sessionToken = generateSessionToken()
    sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await query(
      `INSERT INTO admin_login (username, password_hash, session_token, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) 
       DO UPDATE SET session_token = $3, expires_at = $4`,
      [username, 'env_backed', sessionToken, sessionExpiresAt]
    )

    return sessionToken
  } catch (dbErr) {
    // If the admin_login table doesn't exist, attempt to create it (minimal safe migration) and retry once.
    const isMissingTable = (dbErr as any)?.code === '42P01'
    if (isMissingTable) {
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS admin_login (
            id serial PRIMARY KEY,
            username text UNIQUE NOT NULL,
            password_hash text NOT NULL,
            session_token text,
            expires_at timestamptz,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          )
        `)

        // Retry inserting session
        await query(
          `INSERT INTO admin_login (username, password_hash, session_token, expires_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (username) 
           DO UPDATE SET session_token = $3, expires_at = $4`,
          [username, 'env_backed', sessionToken, sessionExpiresAt]
        )

        return sessionToken
      } catch (retryErr) {
        console.error('[v0] Database session write retry failed:', retryErr)
        return null
      }
    }

    console.error('[v0] Database session write failed:', dbErr)
    return null
  }
}

// Get admin session by token
export async function getAdminSession(sessionToken: string) {
  try {
    const result = await query(
      `SELECT username FROM admin_login 
       WHERE session_token = $1 
       AND expires_at > NOW()`,
      [sessionToken]
    )
    
    return result.rows[0] || null
  } catch (error) {
    console.error('[v0] Error getting admin session:', error)
    // Fail closed: return null so callers treat as unauthorized rather than crashing.
    return null
  }
}

// Invalidate session
export async function invalidateSession(sessionToken: string, type: 'distributor' | 'admin') {
  try {
    if (type === 'distributor') {
      await query(
        `UPDATE distributor_sessions SET session_token = NULL WHERE session_token = $1`,
        [sessionToken]
      )
    } else {
      await query(
        `UPDATE admin_login SET session_token = NULL WHERE session_token = $1`,
        [sessionToken]
      )
    }
    console.log('[v0] Session invalidated')
  } catch (error) {
    console.error('[v0] Error invalidating session:', error)
    throw error
  }
}
