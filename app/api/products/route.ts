import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { resolveFamilyImages } from '@/lib/product-helper'

// Force dynamic fetch by default to avoid build-time static errors, but control client-side and CDN caching via headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM products ORDER BY category, product_name')
    const rows = result.rows ?? []
    
    // Resolve shared images for same-family products
    const resolvedRows = resolveFamilyImages(rows)

    const response = NextResponse.json(resolvedRows)

    // Cache control: Cache in CDN/Browser for 1 minute, stale-while-revalidate for 24 hours
    // This reduces DB load while ensuring fresh data propagates within a minute, or on CDN revalidation.
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
    )

    return response
  } catch (error) {
    console.error('[v0] Database query failed for products API:', error)
    return NextResponse.json(
      { error: 'Products are currently unavailable', details: 'Database query failed' },
      { status: 500 }
    )
  }
}
