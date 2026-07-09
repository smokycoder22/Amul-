'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Database,
  X 
} from 'lucide-react'

interface PreviewRow {
  sapCode: string
  productName: string
  oldPrice: number | null
  newPrice: number
  changed: boolean
  status: 'INSERT' | 'UPDATE'
}

export default function AdminUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/verify-session')
        if (!res.ok) {
          router.replace('/admin/login')
        }
      } catch (err) {
        router.replace('/admin/login')
      }
    }
    checkAuth()
  }, [router])

  const [step, setStep] = useState<'upload' | 'preview'>('upload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string[]>([])
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null)
      setErrorDetails([])
      setLoading(true)
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/admin/upload-excel', {
          method: 'POST',
          body: formData,
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          setErrorDetails(Array.isArray(data.details) ? data.details : [])
          throw new Error(data.error || 'Failed to process file')
        }
        
        setFileName(file.name)
        setSelectedFile(file)
        setPreview(Array.isArray(data.preview) ? data.preview : [])
        setParseErrors(Array.isArray(data.errors) ? data.errors : [])
        setStep('preview')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('[v0] Error processing file:', err)
      } finally {
        setLoading(false)
      }
    },
    []
  )
  
  const handlePublish = async () => {
    if (!selectedFile) {
      setError('File is missing. Please re-upload your Excel file.')
      return
    }
    setError(null)
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/admin/publish-excel', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json().catch(() => ({}))
      
      if (!response.ok) {
        const details = Array.isArray(data.details) ? data.details : []
        setErrorDetails(details)
        throw new Error(data.error || 'Failed to publish prices')
      }
      
      alert(data.message)
      // Route back to dashboard
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Error publishing:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-red-500', 'bg-red-50/50')
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-red-500', 'bg-red-50/50')
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-red-500', 'bg-red-50/50')
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-gray-900 font-sans pb-16">
      <Header role="admin" />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-[#A10B13] hover:text-[#83090F] font-bold transition"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Upload className="text-[#A10B13]" size={22} />
            Pricing Sheets Upload
          </h1>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-5 space-y-3 text-red-700 text-sm font-semibold">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="shrink-0" />
              <span>Error: {error}</span>
            </div>
            {errorDetails.length > 0 && (
              <ul className="list-disc pl-6 space-y-1 text-xs text-red-600 font-medium">
                {errorDetails.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {step === 'upload' ? (
          <div className="space-y-6">
            
            {/* Upload Area */}
            <div 
              className="border-3 border-dashed border-gray-300 rounded-3xl bg-white p-10 sm:p-16 text-center hover:border-[#A10B13] transition-colors cursor-pointer flex flex-col items-center justify-center shadow-xs"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
                className="hidden"
              />
              
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-[#A10B13] border border-red-100">
                <Upload size={28} />
              </div>
              
              <p className="text-lg font-black text-gray-900">
                Drag and drop your Excel file here
              </p>
              <p className="text-xs text-gray-400 font-bold mt-1.5">
                or click to select a file (.xlsx, .xls)
              </p>
            </div>
            
            {/* Guide Info */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-extrabold text-gray-900 text-base">
                <Database className="text-blue-600" size={20} />
                <h3>Expected Excel Fields Map</h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                The spreadsheet columns should contain the following headers exactly (in order). Columns are mapped automatically:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  'SAP Code',
                  'Product Name',
                  'MRP Per Unit',
                  'MRP Per CRT',
                  'Price to Trade Retailer',
                  'Cost to WD',
                  'GST',
                  'Price to WD (Before Tax)'
                ].map((field, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-center text-xs font-bold text-gray-600">
                    {field}
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            
            {/* File details bar */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">{fileName}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Excel parsed successfully</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setStep('upload')
                  setPreview([])
                }}
                className="text-xs font-bold text-[#A10B13] hover:text-[#83090F] px-4 py-2 bg-red-50 rounded-full transition"
              >
                Upload Different File
              </button>
            </div>
            
            {/* Parsing warnings */}
            {parseErrors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-5 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-yellow-800 text-sm">
                  <AlertTriangle size={18} />
                  <h4>Excel Parsing Warnings:</h4>
                </div>
                <ul className="text-xs text-yellow-700 font-semibold space-y-1.5 pl-6 list-disc">
                  {parseErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Preview Changes Table */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-sm">Preview Uploaded Changes</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  SAP Code is hidden in retailer view
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-bold text-gray-400 text-xs uppercase tracking-wider">SAP Code</th>
                      <th className="px-5 py-3.5 text-left font-bold text-gray-400 text-xs uppercase tracking-wider">Product Name</th>
                      <th className="px-5 py-3.5 text-right font-bold text-gray-400 text-xs uppercase tracking-wider">Old Price</th>
                      <th className="px-5 py-3.5 text-right font-bold text-gray-400 text-xs uppercase tracking-wider">New Price</th>
                      <th className="px-5 py-3.5 text-center font-bold text-gray-400 text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.map((row) => (
                      <tr key={row.sapCode} className="hover:bg-gray-50/50 transition duration-150">
                        <td className="px-5 py-4 text-xs font-bold text-gray-500">{row.sapCode}</td>
                        <td className="px-5 py-4 font-bold text-gray-900">{row.productName}</td>
                        <td className="px-5 py-4 text-right text-gray-400 font-semibold">
                          {row.oldPrice ? `₹${row.oldPrice.toFixed(2)}` : '—'}
                        </td>
                        <td className={`px-5 py-4 text-right font-black ${row.changed ? 'text-green-600' : 'text-gray-950'}`}>
                          ₹{row.newPrice.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            row.status === 'INSERT'
                              ? 'bg-green-50 text-green-700 border border-green-100/50'
                              : 'bg-blue-50 text-blue-700 border border-blue-100/50'
                          }`}>
                            {row.status === 'INSERT' ? 'New Item' : 'Price Rev'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-100 text-xs text-gray-500 font-semibold">
                Total rows processed: <span className="font-bold text-gray-900">{preview.length}</span> entries.
              </div>
            </div>
            
            {/* Publish & Cancel CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md shadow-green-100/50 transition-all hover:scale-[1.01]"
              >
                {loading ? 'Publishing...' : '✓ Publish and Sync Database'}
              </Button>
              <Button
                onClick={() => {
                  setStep('upload')
                  setPreview([])
                  router.push('/admin/dashboard')
                }}
                disabled={loading}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 py-3.5 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all"
              >
                Cancel and Return
              </Button>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
