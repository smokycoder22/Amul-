'use client'

import { useState } from 'react'
import { formatProductImageUrl } from '@/lib/utils'

export interface Product {
  sap_code: string
  product_name: string
  category: string
  mrp_per_unit: number | string
  mrp_per_crt: number | string
  retailer_price: number | string
  cost_to_distributor?: number | string
  gst?: number | string
  cost_after_gst?: number | string
  updated_at: string
  image_url?: string
}

interface ProductTableProps {
  products: Product[]
  role: 'retailer' | 'distributor' | 'admin'
}

function formatPrice(value?: number | string): string {
  if (!value && value !== 0) return '₹0.00'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `₹${num.toFixed(2)}`
}

export function ProductTable({ products, role }: ProductTableProps) {
  return (
    <div className="space-y-6">
      {/* Grid View for Mobile/Tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:hidden">
        {products.map((product) => (
          <div key={product.sap_code} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
            {formatProductImageUrl(product.image_url, product.updated_at) ? (
              <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                <img 
                  src={formatProductImageUrl(product.image_url, product.updated_at)!} 
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="h-48 bg-gray-50 flex flex-col items-center justify-center text-center p-4 border-b">
                <span className="text-gray-300 text-2xl mb-1">📦</span>
                <span className="text-xs text-gray-400 font-bold">Image yet to be uploaded</span>
              </div>
            )}
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{product.product_name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">MRP/Unit:</span>
                  <span className="font-medium">{formatPrice(product.mrp_per_unit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MRP/Crate:</span>
                  <span className="font-medium">{formatPrice(product.mrp_per_crt)}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-gray-600">Retailer Price:</span>
                  <span className="font-medium text-red-600">{formatPrice(product.retailer_price)}</span>
                </div>
                {role !== 'retailer' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost to WD:</span>
                      <span className="font-medium">{formatPrice(product.cost_after_gst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST:</span>
                      <span className="font-medium">{product.gst ? `${typeof product.gst === 'string' ? parseFloat(product.gst) : product.gst}%` : '0%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dist. Price:</span>
                      <span className="font-medium text-blue-600">{formatPrice(product.cost_to_distributor)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table View for Desktop */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Image</th>
              <th className="px-4 py-3 text-left font-semibold">Product Name</th>
              <th className="px-4 py-3 text-right font-semibold">MRP/Unit</th>
              <th className="px-4 py-3 text-right font-semibold">MRP/Crate</th>
              <th className="px-4 py-3 text-right font-semibold">Retailer Price</th>
              {role !== 'retailer' && (
                <>
                  <th className="px-4 py-3 text-right font-semibold">Cost to WD</th>
                  <th className="px-4 py-3 text-right font-semibold">GST %</th>
                  <th className="px-4 py-3 text-right font-semibold">Distributor Price</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.sap_code} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  {formatProductImageUrl(product.image_url, product.updated_at) ? (
                    <img 
                      src={formatProductImageUrl(product.image_url, product.updated_at)!} 
                      alt={product.product_name}
                      className="w-12 h-12 object-cover rounded"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold select-none" title="Image yet to be uploaded">
                      No Img
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{product.product_name}</td>
                <td className="px-4 py-3 text-right">{formatPrice(product.mrp_per_unit)}</td>
                <td className="px-4 py-3 text-right">{formatPrice(product.mrp_per_crt)}</td>
                 <td className="px-4 py-3 text-right">{formatPrice(product.retailer_price)}</td>
                {role !== 'retailer' && (
                  <>
                    <td className="px-4 py-3 text-right">{formatPrice(product.cost_after_gst)}</td>
                    <td className="px-4 py-3 text-right">
                      {product.gst ? `${typeof product.gst === 'string' ? parseFloat(product.gst) : product.gst}%` : '0%'}
                    </td>
                    <td className="px-4 py-3 text-right">{formatPrice(product.cost_to_distributor)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
