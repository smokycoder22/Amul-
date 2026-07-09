import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { resolveFamilyImages } from '@/lib/product-helper'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    let totalProducts = 0
    let categoriesCount = 0
    let pendingProducts: any[] = []
    let pendingImagesCount = 0
    let logs: Array<{ event: string; time: string; status: string }> = []

    // 1. Fetch statistics from DB
    const totalProductsRes = await query('SELECT COUNT(*) as count FROM products')
    totalProducts = parseInt(totalProductsRes.rows[0].count, 10) || 0

    const categoriesRes = await query('SELECT COUNT(DISTINCT category) as count FROM products')
    categoriesCount = parseInt(categoriesRes.rows[0].count, 10) || 0

    // Fetch all products to determine which ones still lack an image after family-sharing resolution
    const allProductsRes = await query(
      `SELECT sap_code, product_name, category, image_url 
       FROM products 
       ORDER BY category, product_name`
    )
    const allProducts = allProductsRes.rows ?? []
    const resolvedProducts = resolveFamilyImages(allProducts)

    // Filter to find products that still have no image (neither their own, nor a shared family image)
    pendingProducts = resolvedProducts
      .filter((p) => !p.image_url)
      .map((p) => ({
        sap_code: p.sap_code,
        product_name: p.product_name,
        category: p.category
      }))
    pendingImagesCount = pendingProducts.length

    // 2. Fetch recent upload logs
    const logsRes = await query(
      'SELECT original_file_name, uploaded_at, inserted_count, updated_count, status FROM upload_history ORDER BY uploaded_at DESC LIMIT 5'
    )
    logs = logsRes.rows.map((row) => {
      const time = new Date(row.uploaded_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      if (row.status === 'SUCCESS') {
        return {
          event: `Catalog updated (${row.inserted_count} new, ${row.updated_count} revised) via ${row.original_file_name}`,
          time,
          status: 'success'
        }
      }

      return {
        event: `Failed upload attempt for file ${row.original_file_name}`,
        time,
        status: 'error'
      }
    })

    // Add default log if empty
    if (logs.length === 0) {
      logs.push({
        event: 'System initialized. No pricing sheets uploaded yet.',
        time: 'N/A',
        status: 'info'
      })
    }
    
    return NextResponse.json({
      totalProducts,
      categoriesCount,
      pendingImagesCount,
      pendingProducts,
      logs
    })
  } catch (error) {
    console.error('[v0] Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: 'Database query failed' },
      { status: 500 }
    )
  }
}

