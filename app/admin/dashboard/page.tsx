'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Package, 
  Users, 
  Activity, 
  Clock, 
  CheckCircle, 
  Database,
  ImageOff,
  Search,
  Loader2,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

interface PendingProduct {
  sap_code: string
  product_name: string
  category: string
}

interface DBProduct {
  sap_code: string
  product_name: string
  category: string
  image_url: string | null
  updated_at: string
}

interface SystemLog {
  event: string
  time: string
  status: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    categoriesCount: 0,
    pendingImagesCount: 0
  })
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([])
  const [allProducts, setAllProducts] = useState<DBProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<DBProduct[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [logs, setLogs] = useState<SystemLog[]>([])
  
  // Track which SAP code we are uploading an image for
  const [uploadingSapCode, setUploadingSapCode] = useState<string | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // 1. Fetch Stats, Logs, and Pending List
      const statsRes = await fetch('/api/admin/dashboard-stats')
      if (!statsRes.ok) throw new Error('Failed to load dashboard data')
      const data = await statsRes.json()
      
      setStats({
        totalProducts: data.totalProducts,
        categoriesCount: data.categoriesCount,
        pendingImagesCount: data.pendingImagesCount
      })
      setPendingProducts(data.pendingProducts || [])
      setLogs(data.logs || [])

      // 2. Fetch All Products for Image replacement section
      const productsRes = await fetch('/api/products')
      if (productsRes.ok) {
        const prodData = await productsRes.json()
        setAllProducts(prodData)
        setFilteredProducts(prodData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/verify-session')
        if (!res.ok) {
          router.replace('/admin/login')
          return
        }
        fetchDashboardData()
      } catch (err) {
        router.replace('/admin/login')
      }
    }
    checkAuth()
  }, [router])

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(allProducts)
      return
    }
    const term = searchTerm.toLowerCase()
    setFilteredProducts(
      allProducts.filter(
        p => p.product_name.toLowerCase().includes(term) || p.sap_code.toLowerCase().includes(term)
      )
    )
  }, [searchTerm, allProducts])

  // Trigger hidden input click for a specific product
  const triggerImageUpload = (sapCode: string) => {
    setUploadingSapCode(sapCode)
    fileInputRef.current?.click()
  }

  // Handle image upload and optimization
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingSapCode) return

    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sapCode', uploadingSapCode)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      alert(`Image successfully updated for SAP Code ${uploadingSapCode}`)
      
      // Clear inputs and refresh dashboard
      if (fileInputRef.current) fileInputRef.current.value = ''
      setUploadingSapCode(null)
      fetchDashboardData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
      console.error('[v0] Upload error:', err)
    } finally {
      setUploadLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Active Products',
      value: loading ? '...' : stats.totalProducts.toString(),
      description: 'Dynamic items in catalog',
      icon: Package,
      color: 'text-blue-600 bg-blue-50 border-blue-100/50'
    },
    {
      title: 'Product Categories',
      value: loading ? '...' : stats.categoriesCount.toString(),
      description: 'Milk, Butter, Paneer, etc.',
      icon: Database,
      color: 'text-red-600 bg-red-50 border-red-100/50'
    },
    {
      title: 'Distributors Connected',
      value: 'Pune District',
      description: 'Active region mappings',
      icon: Users,
      color: 'text-green-600 bg-green-50 border-green-100/50'
    },
    {
      title: 'Images Pending Upload',
      value: loading ? '...' : stats.pendingImagesCount.toString(),
      description: 'Products missing pictures',
      icon: ImageOff,
      color: stats.pendingImagesCount > 0 
        ? 'text-amber-600 bg-amber-50 border-amber-100/50 animate-pulse'
        : 'text-green-600 bg-green-50 border-green-100/50'
    }
  ]

  const actions = [
    {
      title: 'Excel Upload & Import',
      description: 'Upload Excel files (.xlsx, .xls) to add new products or bulk update product pricing parameters.',
      icon: Upload,
      ctaText: 'Upload Prices',
      route: '/admin/upload',
      primary: true
    },
    {
      title: 'Batch Image Import',
      description: 'Upload multiple product images renamed by SAP code (e.g. TONCP23.jpg) to optimize and update them in bulk.',
      icon: Upload,
      ctaText: 'Batch Import Images',
      route: '/admin/batch-import',
      primary: true
    },
    {
      title: 'Retailer Catalog View',
      description: 'Open the user-facing FMCG catalog to verify pricing, pack sizes, and images from the retailers perspective.',
      icon: Package,
      ctaText: 'Browse Catalog',
      route: '/products',
      primary: false
    },
    {
      title: 'Distributor Dashboard',
      description: 'Open the distributor catalog to verify distributor cost prices, GST rates, and margins.',
      icon: Users,
      ctaText: 'Open B2B Portal',
      route: '/distributor/dashboard',
      primary: false
    }
  ]

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-gray-900 font-sans pb-16">
      <Header role="admin" />
      
      {/* Hidden file input for image uploads */}
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Global uploading loader overlay */}
      {uploadLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white select-none">
          <Loader2 className="animate-spin text-white mb-4" size={48} />
          <p className="font-extrabold text-lg">Optimizing and Uploading Image...</p>
          <p className="text-xs text-white/70 mt-1">Converting to WebP & compressing for low-bandwidth connections</p>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0D1B2A] tracking-tight">Admin Control Panel</h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Manage product pricing catalog, sheets uploads, and portal channels
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchDashboardData}
              className="p-2 rounded-xl bg-white border hover:bg-gray-50 transition text-gray-600 flex items-center gap-1.5 text-xs font-bold"
              title="Reload stats"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Live Supabase Connected
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-4 text-red-700 text-center max-w-md mx-auto text-sm font-semibold">
            <p>Error loading dashboard statistics.</p>
            <p className="text-xs font-normal mt-1">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-5 flex items-start justify-between shadow-xs hover:shadow-md transition">
                <div className="space-y-3">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">
                    {stat.title}
                  </span>
                  <div className="text-2xl font-black text-gray-900 leading-none">
                    {stat.value}
                  </div>
                  <span className="text-xs text-gray-500 font-semibold block">
                    {stat.description}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Dedicated "New Products – Images Pending" Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageOff className="text-amber-500" size={20} />
              <h3 className="font-extrabold text-gray-900 text-lg">New Products – Images Pending</h3>
            </div>
            <span className="bg-amber-50 text-amber-700 border border-amber-100/50 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {pendingProducts.length} pending
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-gray-400 font-semibold">Loading pending checklist...</p>
          ) : pendingProducts.length === 0 ? (
            <div className="py-6 text-center space-y-1">
              <CheckCircle className="text-green-500 mx-auto" size={32} />
              <p className="text-sm font-bold text-gray-800">All products have active images!</p>
              <p className="text-xs text-gray-400 font-semibold">Fresh uploads will appear here if they lack images.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1">
              {pendingProducts.map((p) => (
                <div key={p.sap_code} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100/60 rounded-2xl">
                  <div className="space-y-1 pr-4">
                    <p className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">{p.product_name}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      SAP Code: {p.sap_code} | {p.category}
                    </p>
                  </div>
                  <Button
                    onClick={() => triggerImageUpload(p.sap_code)}
                    size="sm"
                    className="bg-[#A10B13] hover:bg-[#83090F] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3.5 rounded-xl transition shrink-0 shadow-sm"
                  >
                    Upload Image
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((act, idx) => {
            const Icon = act.icon
            return (
              <div 
                key={idx} 
                className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition gap-6"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    act.primary 
                      ? 'bg-red-50 text-[#A10B13] border border-red-100' 
                      : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}>
                    <Icon size={22} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-gray-900 text-lg leading-snug">
                      {act.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push(act.route)}
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition ${
                    act.primary
                      ? 'bg-[#A10B13] hover:bg-[#83090F] text-white shadow-md shadow-red-200/50'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {act.ctaText}
                  <ArrowRight size={14} />
                </Button>
              </div>
            )
          })}
        </div>

        {/* All Products Image & Replace Management */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h3 className="font-extrabold text-gray-900 text-lg">All Products & Image Management</h3>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or SAP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A10B13]/30 focus:border-[#A10B13] text-xs font-semibold placeholder-gray-400"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-gray-400 font-semibold">Loading catalog details...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-xs text-gray-400 font-bold py-4">No products found matching your search.</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => (
                <div key={p.sap_code} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-gray-50 border rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {p.image_url ? (
                        <img 
                          src={`${p.image_url}?t=${new Date(p.updated_at).getTime()}`} 
                          alt="" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageOff className="text-gray-300" size={16} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug line-clamp-1">{p.product_name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        SAP: <span className="font-bold text-gray-600">{p.sap_code}</span> | {p.category}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => triggerImageUpload(p.sap_code)}
                    size="sm"
                    className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-[#A10B13] border border-transparent hover:border-red-200/50 text-[10px] font-extrabold uppercase py-1.5 px-3 rounded-xl transition"
                  >
                    {p.image_url ? 'Replace Image' : 'Upload Image'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log / History */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-gray-400" size={20} />
            <h3 className="font-extrabold text-gray-900 text-lg">System Event Logs</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {logs.map((log, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    log.status === 'success' 
                      ? 'bg-green-500' 
                      : log.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`} />
                  <span className="text-xs sm:text-sm text-gray-700 font-semibold leading-snug">
                    {log.event}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold shrink-0 uppercase whitespace-nowrap">
                  <Clock size={12} />
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
