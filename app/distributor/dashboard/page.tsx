'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Product } from '@/components/product-table'
import { Search } from 'lucide-react'

export default function DistributorDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categoriesList = [
    { name: 'All Products', slug: '' },
    { name: 'Milk', slug: 'milk' },
    { name: 'Buttermilk', slug: 'buttermilk' },
    { name: 'Paneer', slug: 'paneer' },
    { name: 'Dahi', slug: 'dahi' },
    { name: 'Butter', slug: 'butter' },
    { name: 'Cheese', slug: 'cheese' },
    { name: 'Yogurt', slug: 'yogurt' },
    { name: 'Others', slug: 'others' }
  ]

  useEffect(() => {
    fetchProducts()
  }, [])
  
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = products

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) => p.product_name.toLowerCase().includes(term)
      )
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
      <Header role="distributor" />
      
      {/* Sticky Search & Category Chips Panel */}
      <div className="sticky top-[69px] z-30 bg-white border-b border-gray-200 py-3.5 shadow-sm space-y-3.5">
        
        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search distributor catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#A10B13]/30 focus:border-[#A10B13] focus:bg-white transition text-sm font-medium placeholder-gray-400"
            />
          </div>
        </div>

        {/* Category Chips Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {categoriesList.map((cat) => {
            const isActive = cat.slug.toLowerCase() === selectedCategory.toLowerCase()
            return (
              <button
                key={cat.slug}
                onClick={() => {
                  setSelectedCategory(cat.slug)
                }}
                className={`px-5 py-2 rounded-full whitespace-nowrap text-xs font-extrabold transition-all border ${
                  isActive
                    ? 'bg-[#A10B13] text-white border-[#A10B13] shadow-md shadow-red-200/50'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6 flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#0D1B2A] tracking-tight">Distributor Dashboard</h2>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} in catalog
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#A10B13] border-t-transparent mb-4" />
            <p className="text-gray-400 font-semibold text-sm">Loading distributor catalog...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-700 text-center max-w-md mx-auto">
            <p className="font-bold">Error loading catalog</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.sap_code} 
                product={product} 
                role="distributor" 
              />
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
