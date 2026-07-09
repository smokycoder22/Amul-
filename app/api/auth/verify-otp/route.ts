import { NextRequest, NextResponse } from 'next/server'
import { verifyDistributorOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json()
    
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }
    
    const sessionToken = await verifyDistributorOTP(phoneNumber, otp)
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }
    
    // Create response with success data
    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      sessionToken,
    })
    
    // Set session cookie in response headers
    // In development (localhost), secure must be false. In production, use true.
    response.cookies.set('distributor_session', sessionToken, {
      httpOnly: false, // Allow client-side access for debugging
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('[v0] Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
