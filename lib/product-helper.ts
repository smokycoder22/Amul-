/**
 * Extracts a normalized "family name" for a product by removing quantity, volume, and packaging keywords.
 * Example: "Amul Taaza Toned Milk 500ml Pouch" -> "Amul Taaza Toned Milk"
 * Example: "Amul Premium Paneer 200g Pack" -> "Amul Premium Paneer"
 */
export function getProductFamilyName(name: string): string {
  if (!name) return ''
  
  let cleaned = name.toLowerCase()

  // 1. Remove multiplier with quantity and unit (e.g., 24x500 ml, 28*200 Gm, 12x1 L, 6x1 Kg, etc.)
  // Note: support cases with/without space around 'x'
  cleaned = cleaned.replace(/\b\d+\s*[xX*]\s*\d+(?:\.\d+)?\s*(?:ml|l|g|kg|pcs|pc|crt|ltr|gm|grms|ltrs)\b/gi, '')

  // 2. Remove multiplier with quantity but no unit (e.g., 24x500, 28*200)
  cleaned = cleaned.replace(/\b\d+\s*[xX*]\s*\d+(?:\.\d+)?\b/gi, '')

  // 3. Remove single quantity and unit (e.g., 500ml, 1L, 200g, 5 kg)
  cleaned = cleaned.replace(/\b\d+(?:\.\d+)?\s*(?:ml|l|g|kg|pcs|pc|crt|ltr|gm|grms|ltrs)\b/gi, '')

  // 4. Remove loose multipliers (e.g., 12x, 24x, 2x)
  cleaned = cleaned.replace(/\b\d+\s*[xX*]\b/gi, '')

  // 5. Remove packaging & formatting keywords (case-insensitive words/abbreviations)
  const keywords = [
    'pouch', 'pouches', 'pack', 'packs', 'pkg', 
    'cup', 'cups', 'bucket', 'buckets', 'bottle', 'bottles',
    'can', 'cans', 'carton', 'cartons', 'crt', 'crate', 'crates',
    'box', 'boxes', 'tub', 'tubs', 'tetra', 'tetrapak', 'tetra pack',
    'cbx', 'car', 'ffs', 'ms', 'm.s.', 'block'
  ]
  const keywordsRegex = new RegExp(`\\b(?:${keywords.join('|')})\\b`, 'gi')
  cleaned = cleaned.replace(keywordsRegex, '')

  // 6. Clean punctuation like brackets, hyphens, stars, and trim
  cleaned = cleaned.replace(/[-()[\]*+_,.:;]/g, ' ')

  // 7. Collapse multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // Convert back to Title Case
  return cleaned.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

/**
 * Resolves shared family images across a list of products.
 * If a product does not have its own image_url (or has a local placeholder), but another product
 * in the same family has an uploaded public image_url, this function maps them to use that public image.
 */
export function resolveFamilyImages<T extends { product_name: string; image_url?: string | null }>(products: T[]): T[] {
  const familyBestImage = new Map<string, string>()

  // Step 1: Find the best image for each family
  for (const product of products) {
    const familyName = getProductFamilyName(product.product_name)
    const currentImg = product.image_url ? String(product.image_url).trim() : ''
    
    if (currentImg) {
      const isPublic = currentImg.startsWith('http://') || currentImg.startsWith('https://')
      const existing = familyBestImage.get(familyName)
      
      if (!existing) {
        familyBestImage.set(familyName, currentImg)
      } else {
        const existingIsPublic = existing.startsWith('http://') || existing.startsWith('https://')
        // Prioritize public/supabase URLs over local files
        if (isPublic && !existingIsPublic) {
          familyBestImage.set(familyName, currentImg)
        }
      }
    }
  }

  // Step 2: Assign the best image to all products in that family
  return products.map(product => {
    const familyName = getProductFamilyName(product.product_name)
    const bestImg = familyBestImage.get(familyName)
    
    if (bestImg) {
      const currentImg = product.image_url ? String(product.image_url).trim() : ''
      const isPublic = currentImg.startsWith('http://') || currentImg.startsWith('https://')
      const bestIsPublic = bestImg.startsWith('http://') || bestImg.startsWith('https://')
      
      // Override if:
      // - The product has no image
      // - The product has a local image but the family has a public image
      if (!currentImg || (!isPublic && bestIsPublic)) {
        return {
          ...product,
          image_url: bestImg
        }
      }
    }
    return product
  })
}
