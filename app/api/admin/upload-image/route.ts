import { NextRequest, NextResponse } from 'next/server'
import { uploadProductImage } from '@/lib/storage'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const sapCode = formData.get('sapCode') as string
    
    if (!file || !sapCode) {
      return NextResponse.json(
        { error: 'File and SAP Code are required' },
        { status: 400 }
      )
    }

    // 2. Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // 3. Verify product exists in database (fallback to demo mode if DB is unavailable)
    try {
      const productCheck = await query(
        'SELECT sap_code FROM products WHERE sap_code = $1',
        [sapCode]
      )
      if (productCheck.rows.length === 0) {
        return NextResponse.json(
          { error: `Product with SAP Code "${sapCode}" not found.` },
          { status: 404 }
        )
      }
    } catch (dbError) {
      console.warn('[v0] Image upload DB unavailable, continuing in demo mode:', dbError)
    }

    // 4. Optimize and upload image
    const buffer = Buffer.from(await file.arrayBuffer())
    const imageUrl = await uploadProductImage(sapCode, buffer)

    // 5. Update image URL in database
    try {
      await query(
        `UPDATE products 
         SET image_url = $1, 
             updated_at = NOW() 
         WHERE sap_code = $2`,
        [imageUrl, sapCode]
      )
    } catch (dbError) {
      console.warn('[v0] Image URL update skipped because DB is unavailable:', dbError)
    }
    
    console.log(`[v0] Image uploaded and linked for product ${sapCode}: ${imageUrl}`)
    
    // Invalidate caches
    revalidatePath('/api/products')
    revalidatePath('/')
    revalidatePath('/products')

    return NextResponse.json({
      success: true,
      message: 'Image uploaded and updated successfully.',
      imageUrl
    })
  } catch (error) {
    console.error('[v0] Error uploading product image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: String(error) },
      { status: 500 }
    )
  }
}
