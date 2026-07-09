import * as XLSX from 'xlsx'

export interface ExcelProduct {
  sapCode: string
  productName: string
  category: string
  mrpPerUnit: number
  mrpPerCrt: number
  retailerPrice: number
  costToDistributor: number
  gst: number
  costAfterGst: number
}

export interface ParseResult {
  products: ExcelProduct[]
  errors: string[]
}

export function determineCategory(productName: string, originalCategory: string): string {
  const name = productName.toLowerCase()
  const category = originalCategory.toLowerCase()

  // 1. Buttermilk/Chaas (Check this first so "buttermilk" is not classified as "Butter" or "Milk")
  if (name.includes('buttermilk') || name.includes('chaas') || name.includes('lassi') ||
      category.includes('buttermilk') || category.includes('chaas') || category.includes('lassi')) {
    return 'Buttermilk'
  }

  // 2. Dahi/Curd
  if (name.includes('dahi') || name.includes('curd') ||
      category.includes('dahi') || category.includes('curd')) {
    return 'Dahi'
  }

  // 3. Paneer
  if (name.includes('paneer') ||
      category.includes('paneer')) {
    return 'Paneer'
  }

  // 4. Butter
  if (name.includes('butter') ||
      category.includes('butter')) {
    return 'Butter'
  }

  // 5. Cheese
  if (name.includes('cheese') ||
      category.includes('cheese')) {
    return 'Cheese'
  }

  // 6. Yogurt
  if (name.includes('yogurt') || name.includes('yoghurt') || name.includes('sfy') ||
      category.includes('yogurt') || category.includes('yoghurt') || category.includes('sfy')) {
    return 'Yogurt'
  }

  // 7. Milk
  if (name.includes('milk') || name.includes('taaza') || name.includes('gold') || name.includes('cow') || name.includes('buffalo') || name.includes('slim') ||
      category.includes('milk') || category.includes('taaza') || category.includes('gold') || category.includes('cow') || category.includes('buffalo') || category.includes('slim')) {
    return 'Milk'
  }

  return 'Others'
}

function normalizeString(str: any): string {
  if (str === undefined || str === null) return ''
  return String(str)
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ') // replace linebreaks with spaces
    .replace(/\s+/g, ' ')     // collapse multiple spaces
    .trim()
    .replace(/[\s_-]+/g, '')  // strip spaces, underscores, and dashes for key comparison
}

export async function parseExcelFile(buffer: Buffer): Promise<ParseResult> {
  const products: ExcelProduct[] = []
  const errors: string[] = []
  const seenSapCodes = new Set<string>()
  
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    let worksheet = null
    let sheetName = ''
    let aoa: any[][] = []
    
    // Scan all sheets in the workbook to locate the one containing actual product headers
    for (const name of workbook.SheetNames) {
      const ws = workbook.Sheets[name]
      const sheetAoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][]
      
      const sapCodeAliases = ['sapcode', 'sap_code', 'sapcode']
      const hasHeader = sheetAoa.some(row => 
        row.some(cell => {
          const norm = normalizeString(cell)
          return sapCodeAliases.includes(norm) || norm === 'product' || norm === 'productname'
        })
      )
      
      if (hasHeader) {
        worksheet = ws
        sheetName = name
        aoa = sheetAoa
        break
      }
    }
    
    // Fallback to the first sheet if no sheet matched the headers
    if (!worksheet) {
      sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        errors.push('No sheets found in Excel file')
        return { products, errors }
      }
      worksheet = workbook.Sheets[sheetName]
      aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]
    }
    
    if (aoa.length === 0) {
      errors.push('The Excel sheet is empty')
      return { products, errors }
    }
    
    // Find the header row dynamically by searching for the "SAP Code" or "Product" column header
    let headerIndex = -1
    const sapCodeAliases = ['sapcode', 'sap_code', 'sapcode']
    
    for (let i = 0; i < aoa.length; i++) {
      const row = aoa[i]
      const hasSap = row.some(cell => {
        const norm = normalizeString(cell)
        return sapCodeAliases.includes(norm) || norm === 'product' || norm === 'productname'
      })
      if (hasSap) {
        headerIndex = i
        break
      }
    }
    
    if (headerIndex === -1) {
      errors.push('Could not locate the header row (missing column header like "SAP Code" or "Product")')
      return { products, errors }
    }
    
    const rawHeaders = aoa[headerIndex]
    const headers = rawHeaders.map(h => normalizeString(h))
    
    // Helper to extract cell value from a row using matching header aliases
    const getRowValue = (rowAoa: any[], aliases: string[]): any => {
      const normalizedAliases = aliases.map(a => normalizeString(a))
      for (let i = 0; i < headers.length; i++) {
        if (normalizedAliases.includes(headers[i])) {
          return rowAoa[i]
        }
      }
      return undefined
    }
    
    let currentCategory = 'Others'
    
    // Process rows after the header row
    for (let i = headerIndex + 1; i < aoa.length; i++) {
      const row = aoa[i]
      const rowIndex = i + 1 // 1-based row index for error logs
      
      // Skip completely blank rows
      const isEmpty = row.every(cell => cell === undefined || cell === null || String(cell).trim() === '')
      if (isEmpty) {
        continue
      }
      
      const rawSapCode = getRowValue(row, ['SAP Code', 'sap_code', 'SAP_Code'])
      const rawProductName = getRowValue(row, ['Product', 'Product Name', 'product_name', 'Product_Name'])
      
      const sapCode = rawSapCode !== undefined ? String(rawSapCode).trim() : ''
      const productName = rawProductName !== undefined ? String(rawProductName).trim() : ''

      const mrpVal = getRowValue(row, ['MRP Per Unit', 'MRP Per UNIT'])
      const mrpCrt = getRowValue(row, ['MRP Per Crate', 'MRP per CRT', 'MRP per CRT  (Incl all taxes)'])
      const retPrice = getRowValue(row, ['Retailer Price', 'Price to Trade Retailer', 'Price to TRADE Retailer'])
      const costDist = getRowValue(row, ['Cost To Distributor', 'Price to WD (Before Tax)', 'price_to_wd_before_tax'])
      const costGst = getRowValue(row, ['Cost After GST', 'Cost to WD', 'Cost to WD (Including Tax)'])
      
      const hasPricing = [mrpVal, mrpCrt, retPrice, costDist, costGst].some(val => {
        return val !== undefined && val !== null && String(val).trim() !== ''
      })
      
      // Category detection:
      // 1. Column A (SAP Code) is empty but Column B (Product) contains text.
      // 2. Column A has text containing spaces (descriptive) and there is no pricing data.
      const looksLikeCategory = (!sapCode && productName) || (sapCode.includes(' ') && !hasPricing)
      
      if (looksLikeCategory) {
        const categoryHeading = sapCode || productName
        if (categoryHeading) {
          currentCategory = categoryHeading
        }
        continue
      }
      
      // Validate product fields
      if (!sapCode) {
        errors.push(`Row ${rowIndex}: SAP Code is required`)
        continue
      }
      
      if (!productName) {
        errors.push(`Row ${rowIndex}: Product Name is required`)
        continue
      }
      
      if (seenSapCodes.has(sapCode)) {
        errors.push(`Row ${rowIndex}: Duplicate SAP Code "${sapCode}" found in the same file`)
        continue
      }
      seenSapCodes.add(sapCode)
      
      // Safely parse numbers
      const parseNumeric = (rawVal: any, fieldName: string): number => {
        if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
          return 0
        }
        const cleaned = String(rawVal).replace(/,/g, '').trim()
        const num = Number(cleaned)
        if (isNaN(num)) {
          errors.push(`Row ${rowIndex}: Invalid numeric format for ${fieldName} ("${rawVal}")`)
          return 0
        }
        if (num < 0) {
          errors.push(`Row ${rowIndex}: ${fieldName} cannot be negative ("${rawVal}")`)
          return 0
        }
        return num
      }
      
      const mrpPerUnit = parseNumeric(mrpVal, 'MRP Per Unit')
      const mrpPerCrt = parseNumeric(mrpCrt, 'MRP Per Crate')
      const retailerPrice = parseNumeric(retPrice, 'Retailer Price')
      const costToDistributor = parseNumeric(costDist, 'Cost To Distributor')
      const gst = parseNumeric(getRowValue(row, ['GST', 'gst']), 'GST')
      const costAfterGst = parseNumeric(costGst, 'Cost After GST')
      
      products.push({
        sapCode,
        productName,
        category: determineCategory(productName, currentCategory),
        mrpPerUnit,
        mrpPerCrt,
        retailerPrice,
        costToDistributor,
        gst,
        costAfterGst,
      })
    }
    
    if (products.length > 0) {
      console.log('[v0] Parsed Excel file with', products.length, 'products,', errors.length, 'errors')
      console.log('[v0] Parsed products sample', products.slice(0, 3).map((product) => ({
        sapCode: product.sapCode,
        productName: product.productName,
        retailerPrice: product.retailerPrice,
      })))
    } else {
      console.log('[v0] Parsed Excel file with', products.length, 'products,', errors.length, 'errors')
    }
  } catch (error) {
    errors.push(`Failed to parse Excel file: ${String(error)}`)
  }
  
  return { products, errors }
}
