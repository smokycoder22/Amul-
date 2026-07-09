'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'

export default function ProductsCategoriesPage() {
  const router = useRouter()
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

  const categories = [
    {
      name: 'Milk',
      slug: 'milk',
      emoji: '🥛',
      count: 'View Products',
      image: '/products/001-taaza-500ml.png',
      bgColor: 'bg-white hover:border-[#A10B13]/30',
    },
    {
      name: 'Dahi',
      slug: 'dahi',
      emoji: '🥣',
      count: 'View Products',
      image: '/products/301-dahi-200g.png',
      bgColor: 'bg-white hover:border-[#A10B13]/30',
    },
    {
      name: 'Paneer',
      slug: 'paneer',
      emoji: '🧀',
      count: 'View Products',
      image: '/products/201-paneer-200g.png',
      bgColor: 'bg-white hover:border-[#A10B13]/30',
    },
    {
      name: 'Buttermilk',
      slug: 'buttermilk',
      emoji: '🥤',
      count: 'View Products',
      image: '/products/101-buttermilk-200ml.png',
      bgColor: 'bg-white hover:border-[#A10B13]/30',
    },
    {
      name: 'Butter',
      slug: 'butter',
      emoji: '🧈',
      count: 'View Products',
      image: '/amul-logo-taste-of-india.png',
      bgColor: 'bg-white hover:border-[#A10B13]/30',
    },
    {
      name: 'Cheese',
      slug: 'cheese',
      emoji: '🧀',
      count: 'View Products',
      image: '/amul-logo-taste-of-india.png',
      bgColor: 'bg-white hover:border-[#A10B13]/30',
    },
    {
      name: 'Yogurt',
      slug: 'yogurt',
      emoji: '🍧',
      count: 'View Products',
      image: '/amul-logo-taste-of-india.png',
      bgColor: 'bg-white hover:border-[#A10B13]/30',
    },
    {
      name: 'Others',
      slug: 'others',
      emoji: '📦',
      count: 'View Products',
      image: '/amul-logo-taste-of-india.png',
      bgColor: 'bg-white hover:border-[#A10B13]/30',
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#A10B13] hover:text-[#83090F] font-bold transition"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          
          <div className="flex items-center gap-2.5">
            <img 
              src="/amul-logo-taste-of-india.png" 
              alt="Amul Logo" 
              className="h-10 w-auto bg-white rounded p-0.5 border"
            />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Amul Categories
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        
        {/* Intro */}
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0D1B2A] tracking-tight">
            Browse by Category
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl">
            Select a category to view fresh dairy products and prices from GCMMF Pune.
          </p>
        </div>

        {/* Compact Categories Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">
            All Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <div 
                key={cat.slug}
                onClick={() => router.push(`/products/${cat.slug}`)}
                className={`rounded-3xl border border-gray-200/60 p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-[#A10B13]/30 transition-all duration-300 group select-none ${cat.bgColor}`}
              >
                {/* Category Image */}
                <div className="w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-4 overflow-hidden mb-3 border border-gray-100/50">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Text info */}
                <div className="space-y-1">
                  <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight">
                    {cat.emoji} {cat.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-semibold">
                    {cat.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#111215] text-gray-400 py-10 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm space-y-3">
          <p className="font-semibold text-white/90">AMUL GCMMF PUNE - PRICE PORTAL</p>
          <p>© 2026 AMUL GCMMF PUNE. Trusted by retailers & distributors.</p>
        </div>
      </footer>
    </div>
  )
}
