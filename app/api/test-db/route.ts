import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT
        NOW() AS database_time,
        current_database() AS database_name
    `)

    return NextResponse.json({
      connected: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('DATABASE TEST FAILED:', error)

    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error
          ? error.message
          : String(error),
      },
      { status: 500 }
    )
  }
}