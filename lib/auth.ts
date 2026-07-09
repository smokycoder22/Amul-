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
  const envAdminId = process.env.ADMIN_ID || 'amul@pune'
  const envAdminPassword = process.env.ADMIN_PASSWORD || 'gcmmf123'

  // Accept the demo admin credentials even when the DB isn't configured.
  if (username === envAdminId && password === envAdminPassword) {
    try {
      const sessionToken = generateSessionToken()
      const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      await query(
        `INSERT INTO admin_login (username, password_hash, session_token, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) 
         DO UPDATE SET session_token = $3, expires_at = $4`,
        [username, 'env_backed', sessionToken, sessionExpiresAt]
      )
      console.log('[v0] Admin session created in DB for username:', username)
      return sessionToken
    } catch (dbErr) {
      console.warn('[v0] Database session write failed, falling back to demo session:', dbErr)
      return 'mock-admin-session-token'
    }
  }

  // Developer fallback for testing locally without database/env setup.
  if (process.env.NODE_ENV !== 'production' && username === 'amul@pune' && password === 'gcmmf123') {
    console.warn('[v0] Using dev mock login fallback for demo mode.')
    return 'mock-admin-session-token'
  }

  console.log('[v0] Admin login credentials mismatch for username:', username)
  return null
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
    throw error
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
