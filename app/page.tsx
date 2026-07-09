'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Home, 
  Package, 
  Info, 
  Bell, 
  User, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X 
} from 'lucide-react'
import { Product } from '@/components/product-table'
import { ProductCard } from '@/components/product-card'

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            setProducts(sorted)
            return
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic products:', err)
      }

      setProducts([])
    }
    fetchProducts()
  }, [])

  const newProducts = products.slice(0, 4)
  // for notification count
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

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-gray-900 font-sans">
      
      {/* Header (Navbar) - Red Background */}
      <header className="sticky top-0 z-50 bg-[#A10B13] text-white shadow-lg border-b border-red-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Left: Brand block with uploaded logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <Image
              src="/amul-logo-taste-of-india.png"
              alt="Amul logo"
              width={46}
              height={46}
              className="h-11 w-auto shrink-0 bg-white rounded-lg p-0.5"
              priority
            />
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-wide leading-tight">
                Amul GCMMF PUNE
              </h1>
              <p className="text-[10px] sm:text-xs font-medium text-white/85">Price Portal</p>
            </div>
          </div>

          {/* Center: Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20 transition-all"
            >
              <Home size={15} />
              Home
            </button>
            <button
              onClick={() => router.push('/products')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
            >
              <Package size={15} />
              Products
            </button>
            <button
              onClick={() => router.push('/#about')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
            >
              <Info size={15} />
              About Amul
            </button>
            <button
              onClick={() => router.push('/notifications')}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all"
            >
              <Bell size={15} />
              Updates
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#A10B13] text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-[#A10B13]">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden md:flex items-center">
            <a
              href="tel:+912026830156"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#A10B13] rounded-full font-bold text-sm shadow-md hover:bg-red-50 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              Call: +91 20 2683 0156
            </a>
          </div>

          {/* Mobile Actions: Contact Button next to Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href="tel:+917666463489"
              className="px-3.5 py-1.5 bg-white text-[#A10B13] rounded-full text-xs font-black uppercase tracking-wider shadow-sm hover:bg-red-50 transition"
            >
              Contact
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#900A11] border-t border-red-800/40 px-4 py-6 space-y-4 shadow-xl">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  router.push('/')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-white/10 text-white"
              >
                <Home size={16} />
                Home
              </button>
              <button
                onClick={() => {
                  router.push('/products')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/5 hover:text-white"
              >
                <Package size={16} />
                Products
              </button>
              <button
                onClick={() => {
                  router.push('/#about')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/5 hover:text-white"
              >
                <Info size={16} />
                About Amul
              </button>
              <button
                onClick={() => {
                  router.push('/notifications')
                  setMobileMenuOpen(false)
                }}
                className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/5 hover:text-white w-full text-left"
              >
                <Bell size={16} />
                Updates
                {unreadCount > 0 && (
                  <span className="absolute right-4 bg-white text-[#900A11] text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-[#900A11]">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>
            <div className="pt-4 border-t border-red-800/30">
              <button
                onClick={() => {
                  router.push('/distributor/dashboard')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-[#A10B13] rounded-xl font-bold text-sm shadow-md"
              >
                <User size={18} />
                Distributor Portal
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Full Background Image & Layered Products */}
      <section className="relative overflow-hidden w-full min-h-[440px] sm:min-h-[500px] lg:min-h-[580px] flex items-center bg-white">
        
        {/* Background Image & Soft Gradient overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/amul-banner.jpg"
            alt="Amul Price Portal Banner Background"
            fill
            sizes="100vw"
            className="object-cover object-[80%_center] sm:object-center"
            priority
          />
          {/* Responsive overlay gradient for high text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/20 md:bg-gradient-to-r md:from-white/60 md:via-white/30 md:to-transparent z-0" />
        </div>

        {/* Content Overlaid on top */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl space-y-4 sm:space-y-5 text-left flex flex-col items-start">
            
            <h1 className="text-5xl xs:text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#A10B13] leading-[0.95]">
              Amul<br className="hidden sm:block" />
              <span className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl block mt-1 text-[#0D1B2A]">
                GCMMF PUNE
              </span>
            </h1>

            <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-[#0D1B2A] leading-tight">
              Official Retailer & Distributor Price Portal
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
              <button
                onClick={() => router.push('/products')}
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#A10B13] text-white rounded-full font-bold text-sm sm:text-base hover:bg-[#83090F] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                View Products
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/distributor/dashboard')}
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 bg-white/90 text-gray-900 border-2 border-gray-300 hover:border-[#A10B13] hover:text-[#A10B13] hover:bg-white hover:scale-[1.02] active:scale-[0.98] rounded-full font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md backdrop-blur-sm"
              >
                <User size={16} className="text-gray-600 group-hover:text-[#A10B13] transition-colors" />
                Distributor Portal
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* New Arrivals Section */}
      <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading with slider arrows */}
          <div className="flex flex-row justify-between items-end mb-12 gap-6">
            <div className="space-y-2">
              <span className="text-[#A10B13] text-xs font-black tracking-widest uppercase block">
                NEW ARRIVALS
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-[#0D1B2A]">
                New Product Launches
              </h3>
              <p className="text-sm text-gray-600 font-medium max-w-lg mt-2">
                Discover our latest innovations and fresh additions to the Amul family.
              </p>
            </div>
            
            {/* Carousel navigation placeholders */}
            <div className="hidden sm:flex gap-2">
              <button 
                type="button" 
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                type="button" 
                className="w-10 h-10 rounded-full bg-[#A10B13] flex items-center justify-center text-white hover:bg-[#83090F] transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

         <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 md:gap-6 pb-6 md:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
  {newProducts.map((product) => (
    <div
      key={product.sap_code}
      className="flex-none w-[78vw] max-w-[280px] sm:w-[240px] md:w-auto snap-start"
    >
      <ProductCard
        product={product}
        role="retailer"
      />
    </div>
  ))}
</div>

          {/* View All Button */}
          <div className="text-center pt-12">
            <button
              onClick={() => router.push('/products')}
              className="px-8 py-3.5 bg-[#A10B13] text-white rounded-full font-bold text-sm sm:text-base hover:bg-[#83090F] transition duration-300 shadow-md flex items-center justify-center gap-2 mx-auto"
            >
              View All New Products
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111215] text-gray-400 py-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm space-y-3">
          <p className="font-semibold text-white/90">AMUL GCMMF PUNE - PRICE PORTAL</p>
          <p>© 2026 AMUL GCMMF PUNE. Trusted by retailers & distributors.</p>
        </div>
      </footer>

      {/* Clean custom styling overrides & keyframe animations */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes float-anim {
          0%, 100% { transform: translateY(0px) rotate(0.2deg); }
          50% { transform: translateY(-6px) rotate(-0.2deg); }
        }

        .animate-float-slow {
          animation: float-anim 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-anim 6.5s ease-in-out infinite 1.5s;
        }
        .animate-float-fast {
          animation: float-anim 5s ease-in-out infinite 0.5s;
        }
        .animate-float-extra {
          animation: float-anim 7.2s ease-in-out infinite 2.5s;
        }
      `}</style>
    </div>
  )
}
