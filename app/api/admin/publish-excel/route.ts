import { NextRequest, NextResponse } from 'next/server'
import { parseExcelFile } from '@/lib/excel-parser'
import { getConnection } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
export async function POST(request: NextRequest) {
  let client;
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
    const { products, errors: parseErrors } = await parseExcelFile(buffer)
    
    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No valid products found in Excel file', details: parseErrors },
        { status: 400 }
      )
    }

    // Get connection from pool for transaction safety
    try {
      client = await getConnection()
      await client.query('BEGIN')
    } catch (dbError) {
      console.error('[v0] Publish DB unavailable:', dbError)
      return NextResponse.json(
        { error: 'Database is unavailable for publish', details: 'Failed to open a database transaction' },
        { status: 500 }
      )
    }

    // 1. Create upload history record
    const historyRes = await client.query(
      `INSERT INTO upload_history (original_file_name, total_rows, valid_rows, invalid_rows, inserted_count, updated_count, status)
       VALUES ($1, $2, $3, $4, 0, 0, 'PROCESSING')
       RETURNING id`,
      [file.name, products.length + parseErrors.length, products.length, parseErrors.length]
    )
    const uploadId = historyRes.rows[0].id

    // 2. Fetch all existing products at once (Avoid N+1 queries)
    const existingRes = await client.query(
      `SELECT sap_code, product_name, category, mrp_per_unit, mrp_per_crt, retailer_price, cost_to_distributor, gst, cost_after_gst FROM products`
    )
    const existingMap = new Map(existingRes.rows.map(row => [row.sap_code, row]))

    let insertedCount = 0
    let updatedCount = 0
    const priceChanges: Array<{ sapCode: string; field: string; oldVal: number; newVal: number }> = []

    // 3. Process products
    for (const product of products) {
      const existing = existingMap.get(product.sapCode)

      if (existing) {
        // Track changed fields for price audit history
        const fieldsToCheck = [
          { key: 'mrp_per_unit', label: 'mrp_per_unit', newVal: product.mrpPerUnit },
          { key: 'mrp_per_crt', label: 'mrp_per_crt', newVal: product.mrpPerCrt },
          { key: 'retailer_price', label: 'retailer_price', newVal: product.retailerPrice },
          { key: 'cost_to_distributor', label: 'cost_to_distributor', newVal: product.costToDistributor },
          { key: 'gst', label: 'gst', newVal: product.gst },
          { key: 'cost_after_gst', label: 'cost_after_gst', newVal: product.costAfterGst }
        ]

        for (const field of fieldsToCheck) {
          const oldVal = Number(existing[field.key] || 0)
          if (oldVal !== field.newVal) {
            priceChanges.push({
              sapCode: product.sapCode,
              field: field.label,
              oldVal,
              newVal: field.newVal
            })
          }
        }

        // Update product (preserve image_url by NOT including it in update parameters)
        await client.query(
          `UPDATE products 
           SET product_name = $2,
               category = $3,
               mrp_per_unit = $4,
               mrp_per_crt = $5,
               retailer_price = $6,
               cost_to_distributor = $7,
               gst = $8,
               cost_after_gst = $9,
               updated_at = NOW()
           WHERE sap_code = $1`,
          [
            product.sapCode,
            product.productName,
            product.category || 'Others',
            product.mrpPerUnit,
            product.mrpPerCrt,
            product.retailerPrice,
            product.costToDistributor,
            product.gst,
            product.costAfterGst
          ]
        )
        updatedCount++
      } else {
        // Insert new product (image_url starts as NULL, which is critical)
        await client.query(
          `INSERT INTO products (
             sap_code, product_name, category, mrp_per_unit, mrp_per_crt,
             retailer_price, cost_to_distributor, gst, cost_after_gst, image_url, updated_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, NOW())`,
          [
            product.sapCode,
            product.productName,
            product.category || 'Others',
            product.mrpPerUnit,
            product.mrpPerCrt,
            product.retailerPrice,
            product.costToDistributor,
            product.gst,
            product.costAfterGst
          ]
        )
        insertedCount++
      }
    }

    // 4. Log price changes to price_changes table
    for (const change of priceChanges) {
      await client.query(
        `INSERT INTO price_changes (sap_code, field_name, old_value, new_value, upload_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [change.sapCode, change.field, change.oldVal, change.newVal, uploadId]
      )
    }

    // 5. Update upload history record to Success
    await client.query(
      `UPDATE upload_history 
       SET inserted_count = $1,
           updated_count = $2,
           status = 'SUCCESS'
       WHERE id = $3`,
      [insertedCount, updatedCount, uploadId]
    )

    // Commit transaction
    await client.query('COMMIT')
    console.log('[v0] Excel published successfully:', insertedCount, 'inserted,', updatedCount, 'updated,', priceChanges.length, 'price changes tracked')

    // Invalidate Next.js cache paths
    revalidatePath('/api/products')
    revalidatePath('/')
    revalidatePath('/products')

    return NextResponse.json({
      success: true,
      message: `Prices updated successfully! ${insertedCount} new products added, ${updatedCount} updated.`,
      insertedCount,
      updatedCount,
      parseErrors,
    })
  } catch (error) {
    console.error('[v0] Error publishing Excel:', error)
    if (client) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackErr) {
        console.error('[v0] Rollback error:', rollbackErr)
      }
    }
    return NextResponse.json(
      { error: 'Failed to publish prices', details: String(error) },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
    }
  }
}
