import sharp from 'sharp'
import { supabaseServer } from './supabase'

/**
 * Optimizes an image buffer using sharp:
 * - Resizes to fit within 600x600 px (keeping aspect ratio)
 * - Converts to WebP format
 * - Compresses to 80% quality
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize({
      width: 600,
      height: 600,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer()
}

/**
 * Uploads an optimized image to Supabase Storage and returns the public URL.
 * If the image already exists, it will be overwritten.
 */
export async function uploadProductImage(sapCode: string, buffer: Buffer): Promise<string> {
  if (!supabaseServer) {
    throw new Error('Supabase client is not configured. Check environment variables.')
  }

  const optimizedBuffer = await optimizeImage(buffer)
  const fileName = `${sapCode.trim().toUpperCase()}.webp`

  // Upload/Upsert file in 'product-images' bucket
  const { data, error } = await supabaseServer.storage
    .from('product-images')
    .upload(fileName, optimizedBuffer, {
      contentType: 'image/webp',
      upsert: true, // Overwrites existing files (image replacement)
    })

  if (error) {
    console.error('[v0] Supabase Storage upload error:', error)
    throw error
  }

  // Get the public URL of the uploaded image
  const { data: urlData } = supabaseServer.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
