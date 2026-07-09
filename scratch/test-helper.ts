import { getProductFamilyName, resolveFamilyImages } from '../lib/product-helper'

const testCases = [
  {
    input: 'Amul Taaza 2x6 L Pouch (MS)',
    expected: 'Amul Taaza'
  },
  {
    input: 'Amul Taaza 24x500 ml Pouch (MS)',
    expected: 'Amul Taaza'
  },
  {
    input: 'Amul Gold 12x1 L Pouch',
    expected: 'Amul Gold'
  },
  {
    input: 'Amul Gold 2x6 L Pouch',
    expected: 'Amul Gold'
  },
  {
    input: 'Amul Masti Dahi Cup 28*200 Gm Crate',
    expected: 'Amul Masti Dahi'
  },
  {
    input: 'Amul Masti Dahi Cup 14*400 Gm Crate',
    expected: 'Amul Masti Dahi'
  },
  {
    input: 'Amul Fresh Paneer Block 45x200 Gm Carton',
    expected: 'Amul Fresh Paneer'
  },
  {
    input: 'Amul Fresh Paneer Block 14x1 Kg',
    expected: 'Amul Fresh Paneer'
  },
  {
    input: 'Amul Probiotic Lassi-Rose 24x180ml (Car)',
    expected: 'Amul Probiotic Lassi Rose'
  },
  {
    input: 'Amul Probiotic Buttermilk 24x180ml (Car)',
    expected: 'Amul Probiotic Buttermilk'
  }
]

console.log('--- Testing getProductFamilyName ---')
let passed = 0
for (const tc of testCases) {
  const result = getProductFamilyName(tc.input)
  if (result === tc.expected) {
    console.log(`✅ [PASS] "${tc.input}" -> "${result}"`)
    passed++
  } else {
    console.error(`❌ [FAIL] "${tc.input}" -> Expected: "${tc.expected}", Got: "${result}"`)
  }
}
console.log(`Passed ${passed}/${testCases.length} name checks.`)

console.log('\n--- Testing resolveFamilyImages ---')
const mockProducts = [
  {
    sap_code: 'TONCP23',
    product_name: 'Amul Taaza 24x500 ml Pouch (MS)',
    image_url: 'https://supabase.co/storage/TONCP23.webp'
  },
  {
    sap_code: 'TONCP25',
    product_name: 'Amul Taaza 2x6 L Pouch (MS)',
    image_url: null
  },
  {
    sap_code: 'FCLCP02',
    product_name: 'Amul Gold 12x1 L Pouch',
    image_url: 'https://supabase.co/storage/FCLCP02.webp'
  },
  {
    sap_code: 'FCLIP09',
    product_name: 'Amul Gold 2x6 L Pouch',
    image_url: null
  }
]

const resolved = resolveFamilyImages(mockProducts)
console.log(JSON.stringify(resolved, null, 2))

// Assertions:
// 1. TONCP25 should get TONCP23's image (https://supabase.co/storage/TONCP23.webp)
const pTONCP25 = resolved.find(p => p.sap_code === 'TONCP25')
if (pTONCP25?.image_url === 'https://supabase.co/storage/TONCP23.webp') {
  console.log('✅ [PASS] TONCP25 resolved to public family image')
} else {
  console.error('❌ [FAIL] TONCP25 resolution incorrect:', pTONCP25?.image_url)
}

// 2. FCLIP09 should get FCLCP02's image (https://supabase.co/storage/FCLCP02.webp)
const pFCLIP09 = resolved.find(p => p.sap_code === 'FCLIP09')
if (pFCLIP09?.image_url === 'https://supabase.co/storage/FCLCP02.webp') {
  console.log('✅ [PASS] FCLIP09 resolved to public family image')
} else {
  console.error('❌ [FAIL] FCLIP09 resolution incorrect:', pFCLIP09?.image_url)
}
