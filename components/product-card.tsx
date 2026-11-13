'use client'

import { Product } from './product-table'
import { formatProductImageUrl } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  role: 'retailer' | 'distributor'
}

function formatPrice(value?: number | string): string {
  if (!value && value !== 0) return '₹0.00'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `₹${num.toFixed(2)}`
}

export function ProductCard({ product, role }: ProductCardProps) {
  const packSize = product.product_name.match(/\d+(?:ml|g|kg|L)\b/i)?.[0] || 'Standard Pack'
  
  // Format dates cleanly (e.g. "17 Jun 2026")
  const formattedDate = new Date(product.updated_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  // Calculations for Distributor
  const beforeTax = typeof product.cost_to_distributor === 'string' ? parseFloat(product.cost_to_distributor) : product.cost_to_distributor || 0
  const gstPercent = typeof product.gst === 'string' ? parseFloat(product.gst) : Number(product.gst).toFixed(2) || 0
  const afterTax = typeof product.cost_after_gst === 'string' ? parseFloat(product.cost_after_gst) : product.cost_after_gst || 0

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-red-200/50 transition-all duration-300 flex flex-col group relative">
      
      {/* Product Image Frame */}
      <div className="h-40 sm:h-48 w-full bg-gray-50 flex items-center justify-center p-5 overflow-hidden relative border-b border-gray-100/50">
        {formatProductImageUrl(product.image_url, product.updated_at) ? (
          <img
            src={formatProductImageUrl(product.image_url, product.updated_at)!}
            alt={product.product_name}
            className="w-full h-full object-contain object-center transform group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <span className="text-gray-300 text-3xl mb-1 select-none">📦</span>
            <span className="text-xs text-gray-400 font-bold tracking-tight leading-snug select-none">
              Image yet to be uploaded
            </span>
          </div>
        )}
        {/* Freshly updated badge */}
        {new Date().getTime() - new Date(product.updated_at).getTime() < 30 * 24 * 60 * 60 * 1000 && (
          <div className="absolute top-3 left-3 bg-[#A10B13] text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase">
            Updated
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Name & Pack Size */}
        <div className="space-y-1">
          <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-[#A10B13] transition-colors line-clamp-2">
            {product.product_name}
          </h4>
          <p className="text-xs text-gray-400 font-semibold">{packSize}</p>
        </div>

        {/* Retailer Pricing Section */}
        <div className="space-y-2">
          {/* Highlighted Retailer Price */}
          <div className="bg-red-50/50 border border-red-100/50 rounded-2xl p-2.5 flex flex-col items-start">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Retailer Price
            </span>
            <span className="text-[#A10B13] font-black text-lg sm:text-xl leading-none mt-1">
              {formatPrice(product.retailer_price)}
            </span>
          </div>

          {/* Secondary Retailer pricing details */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 font-medium px-1">
            <div>
              <p className="text-gray-400 font-semibold">MRP/Unit</p>
              <p className="text-gray-900 font-bold">{formatPrice(product.mrp_per_unit)}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold">MRP/Crate</p>
              <p className="text-gray-900 font-bold">{formatPrice(product.mrp_per_crt)}</p>
            </div>
          </div>
        </div>

        {/* Distributor B2B Pricing Section (Visible for Distributor Role) */}
        {role === 'distributor' && (
          <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-3 space-y-1.5 text-[11px]">
            <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-widest block mb-1">
              Distributor Pricing
            </span>
            
            <div className="flex justify-between items-center text-gray-600 font-medium">
              <span>Cost to Distributor</span>
              <span className="font-bold text-gray-900">{formatPrice(beforeTax)}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-600 font-medium">
              <span>GST Applied</span>
              <span className="font-bold text-gray-900">{Number(product.gst).toFixed(2)}%</span>
            </div>
            
            <div className="flex justify-between items-center pt-1.5 border-t border-blue-100/60 font-bold text-blue-700">
              <span>Cost After GST</span>
              <span className="text-sm">{formatPrice(afterTax)}</span>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="pt-2.5 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-medium">
          <span>Last Updated</span>
          <span className="font-bold text-gray-500">{formattedDate}</span>
        </div>

      </div>
      
    </div>
  )
}
