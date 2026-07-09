import { NextRequest, NextResponse } from 'next/server'
import { parseExcelFile } from '@/lib/excel-parser'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/require-admin'
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()

if (!admin) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const { products, errors } = await parseExcelFile(buffer)
    
    if (errors.length > 0 && products.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse Excel file', details: errors },
        { status: 400 }
      )
    }
    
    let existingProducts = new Map<string, { sap_code: string; retailer_price: number }>()
    try {
      const existingResult = await query('SELECT sap_code, retailer_price FROM products')
      existingProducts = new Map(existingResult.rows.map((p: { sap_code: string; retailer_price: number }) => [p.sap_code, p]))
    } catch (dbError) {
      console.error('[v0] Excel preview DB unavailable:', dbError)
      return NextResponse.json(
        { error: 'Failed to load existing products for preview', details: 'Products table is unavailable' },
        { status: 500 }
      )
    }
    
    // Generate preview data (before/after for each product)
    const preview = products.map(p => {
      const existing = existingProducts.get(p.sapCode)
      const oldPrice = existing ? Number(existing.retailer_price) : null
      
      return {
        sapCode: p.sapCode,
        productName: p.productName,
        oldPrice: oldPrice,
        newPrice: p.retailerPrice,
        changed: !existing || oldPrice !== p.retailerPrice,
        status: existing ? 'UPDATE' : 'INSERT',
      }
    })
    
    console.log('[v0] Excel preview generated with', preview.length, 'products')
    
    return NextResponse.json({
      preview,
      errors,
      parseCount: products.length,
    })
  } catch (error) {
    console.error('[v0] Error uploading Excel:', error)
    return NextResponse.json(
      { error: 'Failed to process Excel file', details: String(error) },
      { status: 500 }
    )
  }
}
