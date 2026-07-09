'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Bell, 
  TrendingUp, 
  Plus, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  Trash2 
} from 'lucide-react'

interface NotificationItem {
  id: string
  type: 'price_update' | 'new_product' | 'general'
  title: string
  product: string
  description: string
  time: string
  unread: boolean
  link: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'prices' | 'products'>('all')

  useEffect(() => {
    const defaultNotifications: NotificationItem[] = [
      {
        id: '1',
        type: 'price_update',
        title: 'Price Updated',
        product: 'Amul Gold Milk',
        description: 'Price revised today',
        time: 'Today, 10:30 AM',
        unread: true,
        link: '/products/milk'
      },
      {
        id: '2',
        type: 'new_product',
        title: 'New Product Added',
        product: 'Paneer category updated',
        description: 'Paneer category updated',
        time: 'Today, 9:15 AM',
        unread: true,
        link: '/products/paneer'
      },
      {
        id: '3',
        type: 'price_update',
        title: 'Price Updated',
        product: 'Amul Masti Spiced Buttermilk 200ml',
        description: 'Retailer margins adjusted to ₹13.50',
        time: 'Yesterday',
        unread: false,
        link: '/products/buttermilk'
      },
      {
        id: '4',
        type: 'new_product',
        title: 'New Product Added',
        product: 'Amul Premium Paneer 200g Pack',
        description: 'Fresh paneer batch is now online for booking',
        time: '2 days ago',
        unread: false,
        link: '/products/paneer'
      },
      {
        id: '5',
        type: 'general',
        title: 'System Update',
        product: 'Amul Price Portal',
        description: 'Dynamic listings and catalog views are now online',
        time: '3 days ago',
        unread: false,
        link: '/products'
      }
    ]

    const saved = localStorage.getItem('amul_notifications_list')
    if (saved) {
      setNotifications(JSON.parse(saved))
    } else {
      setNotifications(defaultNotifications)
      localStorage.setItem('amul_notifications_list', JSON.stringify(defaultNotifications))
      
      const unreadCount = defaultNotifications.filter(n => n.unread).length
      localStorage.setItem('amul_unread_notifications', unreadCount.toString())
      window.dispatchEvent(new Event('notifications_updated'))
    }
  }, [])

  const updateLocalStorage = (updatedList: NotificationItem[]) => {
    setNotifications(updatedList)
    localStorage.setItem('amul_notifications_list', JSON.stringify(updatedList))
    const count = updatedList.filter(n => n.unread).length
    localStorage.setItem('amul_unread_notifications', count.toString())
    window.dispatchEvent(new Event('notifications_updated'))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }))
    updateLocalStorage(updated)
  }

  const handleNotificationClick = (item: NotificationItem) => {
    const updated = notifications.map(n => n.id === item.id ? { ...n, unread: false } : n)
    updateLocalStorage(updated)
    router.push(item.link)
  }

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = notifications.filter(n => n.id !== id)
    updateLocalStorage(updated)
  }

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'prices') return notif.type === 'price_update'
    if (activeTab === 'products') return notif.type === 'new_product'
    return true
  })

  const unreadTotal = notifications.filter(n => n.unread).length
  const unreadPrices = notifications.filter(n => n.unread && n.type === 'price_update').length
  const unreadProducts = notifications.filter(n => n.unread && n.type === 'new_product').length

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-gray-900 font-sans pb-16">
      
      {/* Dynamic Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#A10B13] hover:text-[#83090F] font-bold transition"
          >
            <ArrowLeft size={20} />
            Home
          </button>
          
          <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="text-[#A10B13]" size={22} />
            Updates & Notifications
          </h1>

          <div className="w-12 sm:w-16" />
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        
        {/* Interactive Controls & Tabs Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-[#A10B13] text-white border-[#A10B13] shadow-md shadow-red-200/50'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              All Alerts
              {unreadTotal > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'all' ? 'bg-white text-[#A10B13]' : 'bg-red-500 text-white'}`}>
                  {unreadTotal}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('prices')}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                activeTab === 'prices'
                  ? 'bg-[#A10B13] text-white border-[#A10B13] shadow-md shadow-red-200/50'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Price Revisions
              {unreadPrices > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'prices' ? 'bg-white text-[#A10B13]' : 'bg-red-500 text-white'}`}>
                  {unreadPrices}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-[#A10B13] text-white border-[#A10B13] shadow-md shadow-red-200/50'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              New Arrivals
              {unreadProducts > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'products' ? 'bg-white text-[#A10B13]' : 'bg-red-500 text-white'}`}>
                  {unreadProducts}
                </span>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          {unreadTotal > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-[#A10B13] hover:text-[#83090F] bg-red-50/50 border border-red-100 rounded-full transition hover:bg-red-50"
            >
              <CheckCircle2 size={15} />
              Mark all as read
            </button>
          )}

        </div>

        {/* Dynamic List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            
            /* Empty State Layout */
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell size={28} className="text-gray-300" />
              </div>
              <h3 className="font-extrabold text-gray-800 text-base">No Notifications</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-xs mt-1">
                {activeTab === 'all' 
                  ? "You're all caught up! There are no new announcements." 
                  : `No recent notifications found under this folder.`}
              </p>
            </div>
            
          ) : (
            filteredNotifications.map((notif) => {
              const isPrice = notif.type === 'price_update'
              const isProduct = notif.type === 'new_product'
              
              // Dynamic themes for visual feedback
              const iconBg = isPrice 
                ? 'bg-red-50 text-red-600 border border-red-100/50' 
                : isProduct 
                  ? 'bg-green-50 text-green-600 border border-green-100/50' 
                  : 'bg-blue-50 text-blue-600 border border-blue-100/50'

              const cardBg = notif.unread 
                ? 'bg-white border-l-[4px] border-l-[#A10B13] border-gray-200/80 shadow-md shadow-red-50/20' 
                : 'bg-white/80 border-l-[4px] border-l-gray-300 border-gray-200/40 opacity-90'

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`rounded-3xl border p-4 sm:p-5 flex gap-4 transition duration-300 hover:shadow-lg cursor-pointer group relative ${cardBg}`}
                >
                  
                  {/* Left: Dynamic Icon Frame */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    {isPrice && <TrendingUp size={22} />}
                    {isProduct && <Plus size={22} />}
                    {!isPrice && !isProduct && <Info size={22} />}
                  </div>

                  {/* Center: Message block */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isPrice 
                          ? 'bg-red-50 text-red-600' 
                          : isProduct 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-blue-50 text-blue-600'
                      }`}>
                        {isPrice ? 'Price Revised' : isProduct ? 'New Launch' : 'System Alert'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{notif.time}</span>
                    </div>

                    <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-[#A10B13] transition-colors">
                      {notif.product}
                    </h4>
                    
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">
                      {notif.description}
                    </p>

                    {/* Action link indicator */}
                    <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#A10B13] group-hover:underline">
                      View Catalog
                      <ChevronRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Right Actions: Delete & Glow */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    
                    {/* Unread Glowing Dot */}
                    {notif.unread ? (
                      <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse mt-1" />
                    ) : (
                      <div className="h-2 w-2" />
                    )}

                    {/* Delete Icon */}
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                </div>
              )
            })
          )}
        </div>

      </main>

      {/* Styles */}
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
