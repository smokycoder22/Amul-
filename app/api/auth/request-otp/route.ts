import { NextRequest, NextResponse } from 'next/server'
import { createDistributorOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()
    
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }
    
    const result = await createDistributorOTP(phoneNumber)
    
    // In production, send OTP via SMS. For MVP, return it for testing
    return NextResponse.json({
      success: true,
      message: 'OTP sent to your phone',
      otp: result.otp, // Remove in production
    })
  } catch (error) {
    console.error('[v0] Error generating OTP:', error)
    return NextResponse.json(
      { error: 'Failed to generate OTP' },
      { status: 500 }
    )
  }
}
