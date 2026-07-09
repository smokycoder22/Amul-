const path = require('path');
const projPath = 'C:\\Users\\Parth khismatrao\\OneDrive\\Desktop\\Amul';
const XLSX = require(path.join(projPath, 'node_modules/xlsx'));

const filePath = 'C:\\Users\\Parth khismatrao\\.gemini\\antigravity\\brain\\8646e6c9-1595-4da9-9418-58e8a145c289\\scratch\\test-excel.xlsx';
console.log('Reading:', filePath);

function normalizeString(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ') // replace linebreaks with spaces
    .replace(/\s+/g, ' ')     // collapse multiple spaces
    .trim()
    .replace(/[\s_-]+/g, ''); // strip spaces, underscores, and dashes for key comparison
}

function parseExcelFileTest(buffer) {
  const products = [];
  const errors = [];
  const seenSapCodes = new Set();
  
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // 1. Read sheet as Array of Arrays to find header row dynamically
  const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (aoa.length === 0) {
    return { products, errors: ['The sheet is empty'] };
  }
  
  // Find header row index
  let headerIndex = -1;
  const sapCodeAliases = ['sapcode', 'sap_code', 'sapcode'];
  
  for (let i = 0; i < aoa.length; i++) {
    const row = aoa[i];
    // Check if this row looks like a header row
    const hasSap = row.some(cell => {
      const norm = normalizeString(cell);
      return sapCodeAliases.includes(norm) || norm === 'product' || norm === 'productname';
    });
    if (hasSap) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    return { products, errors: ['Could not locate the header row (missing "SAP Code" or "Product")'] };
  }
  
  const rawHeaders = aoa[headerIndex];
  console.log('Detected raw headers:', rawHeaders);
  
  // Normalize the header strings for matching
  const headers = rawHeaders.map(h => normalizeString(h));
  console.log('Normalized headers:', headers);

  // Helper to map values from row array by header alias
  function getRowValue(rowAoa, aliases) {
    const normalizedAliases = aliases.map(a => normalizeString(a));
    for (let i = 0; i < headers.length; i++) {
      if (normalizedAliases.includes(headers[i])) {
        return rowAoa[i];
      }
    }
    return undefined;
  }

  let currentCategory = 'Others';

  // 2. Parse data rows following the header row
  for (let i = headerIndex + 1; i < aoa.length; i++) {
    const row = aoa[i];
    const rowIndex = i + 1; // 1-based index for error reporting
    
    // Skip completely blank rows
    const isEmpty = row.every(cell => cell === undefined || cell === null || String(cell).trim() === '');
    if (isEmpty) {
      console.log(`Row ${rowIndex} is blank. Skipped.`);
      continue;
    }

    const rawSapCode = getRowValue(row, ['SAP Code', 'sap_code']);
    const rawProductName = getRowValue(row, ['Product', 'Product Name', 'product_name']);
    
    const sapCode = rawSapCode !== undefined ? String(rawSapCode).trim() : '';
    const productName = rawProductName !== undefined ? String(rawProductName).trim() : '';
    
    // Pricing checks
    const mrpVal = getRowValue(row, ['MRP Per Unit', 'MRP Per UNIT']);
    const mrpCrt = getRowValue(row, ['MRP Per Crate', 'MRP per CRT', 'MRP per CRT  (Incl all taxes)']);
    const retPrice = getRowValue(row, ['Retailer Price', 'Price to Trade Retailer', 'Price to TRADE Retailer']);
    const costDist = getRowValue(row, ['Cost To Distributor', 'Price to WD (Before Tax)']);
    const costGst = getRowValue(row, ['Cost After GST', 'Cost to WD', 'Cost to WD (Including Tax)']);
    
    const hasPricing = [mrpVal, mrpCrt, retPrice, costDist, costGst].some(val => {
      return val !== undefined && val !== null && String(val).trim() !== '';
    });
    
    // Category detection:
    // 1. Column A (SAP Code) is empty but Column B (Product) contains text.
    // 2. Column A has text containing spaces (descriptive) and there is no pricing data.
    const looksLikeCategory = (!sapCode && productName) || (sapCode.includes(' ') && !hasPricing);
    
    if (looksLikeCategory) {
      const categoryHeading = sapCode || productName;
      if (categoryHeading) {
        currentCategory = categoryHeading;
        console.log(`Row ${rowIndex}: Category group heading encountered: "${currentCategory}". Subsequent products will map here.`);
      }
      continue;
    }

    // Real product validation
    if (!sapCode) {
      errors.push(`Row ${rowIndex}: SAP Code is required`);
      continue;
    }
    
    if (!productName) {
      errors.push(`Row ${rowIndex}: Product Name is required`);
      continue;
    }
    
    if (seenSapCodes.has(sapCode)) {
      errors.push(`Row ${rowIndex}: Duplicate SAP Code "${sapCode}" found in the same file`);
      continue;
    }
    seenSapCodes.add(sapCode);
    
    // Parse numeric fields safely
    function parseNumeric(rawVal, fieldName) {
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
        return 0;
      }
      // Strip commas if any
      const cleaned = String(rawVal).replace(/,/g, '').trim();
      const num = Number(cleaned);
      if (isNaN(num)) {
        errors.push(`Row ${rowIndex}: Invalid numeric format for ${fieldName} ("${rawVal}")`);
        return 0;
      }
      if (num < 0) {
        errors.push(`Row ${rowIndex}: ${fieldName} cannot be negative ("${rawVal}")`);
        return 0;
      }
      return num;
    }

    const mrpPerUnit = parseNumeric(mrpVal, 'MRP Per Unit');
    const mrpPerCrt = parseNumeric(mrpCrt, 'MRP Per Crate');
    const retailerPrice = parseNumeric(retPrice, 'Retailer Price');
    const costToDistributor = parseNumeric(costDist, 'Cost To Distributor');
    const gst = parseNumeric(getRowValue(row, ['GST']), 'GST');
    const costAfterGst = parseNumeric(costGst, 'Cost After GST');
    
    products.push({
      sapCode,
      productName,
      category: currentCategory,
      mrpPerUnit,
      mrpPerCrt,
      retailerPrice,
      costToDistributor,
      gst,
      costAfterGst
    });
  }
  
  return { products, errors };
}

try {
  const fs = require('fs');
  const buffer = fs.readFileSync(filePath);
  const result = parseExcelFileTest(buffer);
  console.log('Result products count:', result.products.length);
  console.log('Result products:', JSON.stringify(result.products, null, 2));
  console.log('Result errors count:', result.errors.length);
  console.log('Result errors:', result.errors);
} catch (e) {
  console.error(e);
}
