import { NextRequest, NextResponse } from 'next/server'
import { uploadProductImage } from '@/lib/storage'
import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

interface FileReport {
  fileName: string
  status: 'uploaded' | 'skipped' | 'failed'
  sapCode: string
  reason?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const replaceMode = formData.get('replaceMode') === 'true'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    let uploaded = 0
    let skipped = 0
    let failed = 0
    const details: FileReport[] = []

    for (const file of files) {
      const fileName = file.name
      // Extract SAP code from filename (e.g. "TONCP23.jpg" -> "TONCP23")
      const lastDotIndex = fileName.lastIndexOf('.')
      const rawSapCode = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName
      const sapCode = rawSapCode.trim().toUpperCase()

      if (!sapCode) {
        skipped++
        details.push({
          fileName,
          status: 'skipped',
          sapCode,
          reason: 'Could not extract valid SAP code from filename'
        })
        continue
      }

      // Validate MIME type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        skipped++
        details.push({
          fileName,
          status: 'skipped',
          sapCode,
          reason: 'Invalid file type. Only JPG, PNG, and WebP are allowed.'
        })
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        failed++
        details.push({
          fileName,
          status: 'failed',
          sapCode,
          reason: 'File size exceeds 5MB limit.'
        })
        continue
      }

      try {
        // Check if product exists in DB
        const productCheck = await query(
          'SELECT sap_code, image_url FROM products WHERE sap_code = $1',
          [sapCode]
        )

        if (productCheck.rows.length === 0) {
          skipped++
          details.push({
            fileName,
            status: 'skipped',
            sapCode,
            reason: `Product with SAP Code "${sapCode}" not found in database`
          })
          continue
        }

        const existingProduct = productCheck.rows[0]

        // If product already has an image, skip unless replaceMode is enabled
        if (existingProduct.image_url && !replaceMode) {
          skipped++
          details.push({
            fileName,
            status: 'skipped',
            sapCode,
            reason: 'Product already has an image (Replace mode disabled)'
          })
          continue
        }

        // Optimize and upload image
        const buffer = Buffer.from(await file.arrayBuffer())
        const imageUrl = await uploadProductImage(sapCode, buffer)

        // Update database row
        await query(
          `UPDATE products 
           SET image_url = $1, 
               updated_at = NOW() 
           WHERE sap_code = $2`,
          [imageUrl, sapCode]
        )

        uploaded++
        details.push({
          fileName,
          status: 'uploaded',
          sapCode
        })
      } catch (err) {
        console.error(`Failed to process batch image for SAP Code ${sapCode}:`, err)
        failed++
        details.push({
          fileName,
          status: 'failed',
          sapCode,
          reason: err instanceof Error ? err.message : String(err)
        })
      }
    }

    // Invalidate Next.js cache paths
    revalidatePath('/api/products')
    revalidatePath('/')
    revalidatePath('/products')

    return NextResponse.json({
      success: true,
      uploaded,
      skipped,
      failed,
      details
    })
  } catch (error) {
    console.error('[v0] Error processing batch upload:', error)
    return NextResponse.json(
      { error: 'Failed to process batch upload', details: String(error) },
      { status: 500 }
    )
  }
}
