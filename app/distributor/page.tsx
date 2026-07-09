'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DistributorPageRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/distributor/dashboard')
  }, [router])
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500">Redirecting to distributor dashboard...</p>
    </div>
  )
}
