'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Bell, Search, ArrowLeft } from 'lucide-react'
import { Product } from '@/components/product-table'
import { ProductCard } from '@/components/product-card'

export default function CategoryProductsPage() {
  const router = useRouter()
  const params = useParams()
  const categoryParam = params.category as string
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [decodedCategory, setDecodedCategory] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('amul_unread_notifications')
    if (saved !== null) {
      setUnreadCount(parseInt(saved, 10))
    } else {
      setUnreadCount(2)
      localStorage.setItem('amul_unread_notifications', '2')
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem('amul_unread_notifications')
      setUnreadCount(updated ? parseInt(updated, 10) : 0)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('notifications_updated', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('notifications_updated', handleStorageChange)
    }
  }, [])

  const categoriesList = [
    { name: 'Milk', slug: 'milk' },
    { name: 'Dahi', slug: 'dahi' },
    { name: 'Paneer', slug: 'paneer' },
    { name: 'Buttermilk', slug: 'buttermilk' },
    { name: 'Butter', slug: 'butter' },
    { name: 'Cheese', slug: 'cheese' },
    { name: 'Yogurt', slug: 'yogurt' },
    { name: 'Others', slug: 'others' }
  ]

  useEffect(() => {
    if (categoryParam) {
      setDecodedCategory(decodeURIComponent(categoryParam))
    }
  }, [categoryParam])

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
    } catch (err) {
      console.error('[v0] Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!decodedCategory) return

    let filtered = products.filter(
      (p) => p.category.toLowerCase() === decodedCategory.toLowerCase()
    )

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) => p.product_name.toLowerCase().includes(term) || p.sap_code.toLowerCase().includes(term)
      )
    }

    setFilteredProducts(filtered)
  }, [searchTerm, decodedCategory, products])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
      
      {/* Sticky Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/products')}
            className="flex items-center gap-2 text-[#A10B13] hover:text-[#83090F] font-bold transition"
          >
            <ArrowLeft size={20} />
            Categories
          </button>
          
          <div className="flex items-center gap-2.5">
            <img 
              src="/amul-logo-taste-of-india.png" 
              alt="Amul Logo" 
              className="h-10 w-auto bg-white rounded p-0.5 border"
            />
            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight capitalize">
              {decodedCategory} Products
            </h1>
          </div>

          <button
            onClick={() => router.push('/notifications')}
            className="text-gray-600 hover:text-gray-900 relative p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#A10B13] text-white text-[9px] font-bold h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Sticky Search & Category Chips Panel */}
      <div className="sticky top-[65px] z-30 bg-white border-b border-gray-200 py-3.5 shadow-sm space-y-3.5">
        
        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Search by product name or SAP in ${decodedCategory}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#A10B13]/30 focus:border-[#A10B13] focus:bg-white transition text-sm font-medium placeholder-gray-400"
            />
          </div>
        </div>

        {/* Category top list */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {categoriesList.map((cat) => {
            const isActive = cat.slug.toLowerCase() === categoryParam.toLowerCase()
            return (
              <button
                key={cat.slug}
                onClick={() => {
                  setSearchTerm('')
                  router.push(`/products/${cat.slug}`)
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

      {/* Main Listing Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Product Count indicator */}
        <div className="mb-6 text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} found
        </div>

        {/* Dynamic Card Grid (Mobile: 2 per row, Desktop: 4 per row) */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#A10B13] border-t-transparent mb-4" />
            <p className="text-gray-400 font-semibold text-sm">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8">
            <p className="text-gray-400 font-bold text-sm">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.sap_code}
                product={product}
                role="retailer"
              />
            ))}
          </div>
        )}
      </main>

      {/* Custom Styles */}
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
