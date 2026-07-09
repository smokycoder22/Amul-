'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bell } from 'lucide-react'

function BrandBlock() {
  return (
    <Link href="/" className="flex items-center gap-3 cursor-pointer">
      <Image
        src="/amul-logo-taste-of-india.png"
        alt="Amul logo"
        width={44}
        height={44}
        className="h-11 w-auto shrink-0 bg-white rounded-lg p-0.5"
        priority
      />
      <div>
        <div className="text-base font-bold tracking-wide leading-tight sm:text-lg">
          AMUL GCMMF PUNE
        </div>
        <div className="text-xs font-medium text-white/80">Price Portal</div>
      </div>
    </Link>
  )
}

export function Header({ role }: { role?: 'retailer' | 'distributor' | 'admin' }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Default to 2 if not initialized
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

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        window.location.href = role === 'admin' ? '/admin/login' : '/distributor/login'
      }
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#E63946] text-white shadow-md border-b border-red-700/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <BrandBlock />

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/notifications"
            className="relative p-1.5 text-white hover:bg-white/10 rounded-full transition flex items-center justify-center"
            title="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-white text-[#E63946] text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-[#E63946]">
                {unreadCount}
              </span>
            )}
          </Link>

          {role && (
            <span className="text-sm font-medium bg-white/15 border border-white/20 px-3 py-1 rounded-full capitalize">
              {role}
            </span>
          )}

          {(role === 'admin' || role === 'distributor') && (
            <button
              onClick={handleLogout}
              className="text-sm font-medium bg-red-800 hover:bg-red-950 border border-red-950 px-3 py-1 rounded-full cursor-pointer transition-colors"
            >
              Logout
            </button>
          )}

        </div>

        {/* Mobile Actions (Bell + Logout) */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/notifications"
            className="relative p-2 text-white hover:bg-white/10 rounded-full transition flex items-center justify-center"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-white text-[#E63946] text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-[#E63946]">
                {unreadCount}
              </span>
            )}
          </Link>

          {(role === 'admin' || role === 'distributor') && (
            <button
              onClick={handleLogout}
              className="text-xs font-semibold bg-red-800 hover:bg-red-950 border border-red-950 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            >
              Logout
            </button>
          )}
          
        </div>
      </div>
    </header>
  )
}
