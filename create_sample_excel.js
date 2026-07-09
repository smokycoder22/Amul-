const XLSX = require('xlsx');

// Sample product data for Excel import
const data = [
  {
    'SAP Code': '001',
    'Product Name': 'Amul Taaza Full Cream 500ml',
    'MRP Per Unit': 35.00,
    'MRP Per CRT': 630.00,
    'Price to Trade Retailer': 31.00,
    'Cost to WD': 24.00,
    'GST': 5.00,
    'Price to WD (Before Tax)': 29.00
  },
  {
    'SAP Code': '002',
    'Product Name': 'Amul Taaza Full Cream 1L',
    'MRP Per Unit': 62.00,
    'MRP Per CRT': 1116.00,
    'Price to Trade Retailer': 55.00,
    'Cost to WD': 43.00,
    'GST': 5.00,
    'Price to WD (Before Tax)': 51.00
  },
  {
    'SAP Code': '005',
    'Product Name': 'Amul Gold 500ml',
    'MRP Per Unit': 38.00,
    'MRP Per CRT': 684.00,
    'Price to Trade Retailer': 34.00,
    'Cost to WD': 27.00,
    'GST': 5.00,
    'Price to WD (Before Tax)': 32.00
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');
XLSX.writeFile(wb, 'public/sample-prices.xlsx');
console.log('Sample Excel file created: public/sample-prices.xlsx');
