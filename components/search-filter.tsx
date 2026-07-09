'use client'

import { useState, useMemo, useEffect } from 'react'
import { Product } from './product-table'

interface SearchFilterProps {
  products: Product[]
  onFiltered: (products: Product[]) => void
}

export function SearchFilter({ products, onFiltered }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)))
    return cats.sort()
  }, [products])
  
  useEffect(() => {
    let filtered = products
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.product_name.toLowerCase().includes(term) ||
        p.sap_code.toLowerCase().includes(term)
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    onFiltered(filtered)
  }, [searchTerm, selectedCategory, products, onFiltered])
  
  return (
    <div className="flex flex-col gap-4 mb-6">
      <input
        type="text"
        placeholder="Search by product name or SAP code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === ''
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
