'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Upload, 
  FileImage, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react'

interface UploadResultDetail {
  fileName: string
  status: 'uploaded' | 'skipped' | 'failed'
  sapCode: string
  reason?: string
}

export default function BatchImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Auth state
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  // UI states
  const [files, setFiles] = useState<File[]>([])
  const [replaceMode, setReplaceMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Report state
  const [report, setReport] = useState<{
    uploaded: number
    skipped: number
    failed: number
    details: UploadResultDetail[]
  } | null>(null)

  // Verify auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/verify-session', { cache: 'no-store' })
        if (!res.ok) {
          router.replace('/admin/login')
          return
        }
        setCheckingAuth(false)
      } catch (err) {
        router.replace('/admin/login')
      }
    }
    checkAuth()
  }, [router])

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
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const addFiles = (newFiles: File[]) => {
    setError(null)
    setReport(null)
    const validImages = newFiles.filter(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
    if (validImages.length < newFiles.length) {
      setError('Some files were ignored because they are not JPG, PNG, or WebP images.')
    }
    
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      const uniqueNew = validImages.filter(f => !existingNames.has(f.name))
      return [...prev, ...uniqueNew]
    })
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setLoading(true)
    setError(null)
    setReport(null)
    
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('replaceMode', String(replaceMode))

      const res = await fetch('/api/admin/batch-upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload batch images')
      }

      setReport({
        uploaded: data.uploaded,
        skipped: data.skipped,
        failed: data.failed,
        details: data.details || []
      })
      setFiles([]) // Clear queue on success
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <Loader2 className="animate-spin text-[#A10B13] mx-auto" size={32} />
          <p className="text-sm font-semibold text-gray-500">Checking authorization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-gray-900 font-sans pb-16">
      <Header role="admin" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-[#A10B13] hover:text-[#83090F] font-bold transition text-sm"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            <img 
              src="/amul-logo-taste-of-india.png" 
              alt="Amul Logo" 
              className="h-8 w-auto bg-white rounded p-0.5 border"
            />
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Batch Image Import
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-5 flex items-start gap-3 text-red-700 text-sm font-semibold">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left panel: dropzone and options */}
          <div className="md:col-span-2 space-y-6">
            
            {/* File Dropzone */}
            <div
              className="border-3 border-dashed border-gray-300 rounded-3xl bg-white p-8 text-center hover:border-[#A10B13] transition-colors cursor-pointer flex flex-col items-center justify-center shadow-xs"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  if (e.target.files) {
                    addFiles(Array.from(e.target.files))
                  }
                }}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3.5 text-[#A10B13] border border-red-100">
                <Upload size={24} />
              </div>
              <p className="text-base font-black text-gray-900">
                Drag & drop SAP-named images here
              </p>
              <p className="text-xs text-gray-400 font-bold mt-1">
                Supports JPG, PNG, and WebP up to 5MB
              </p>
            </div>

            {/* Selected files queue */}
            {files.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-extrabold text-sm text-gray-900">
                    Upload Queue ({files.length} files)
                  </h3>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-gray-400 hover:text-red-500 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="divide-y divide-gray-100 max-h-[260px] overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-2.5">
                        <FileImage className="text-gray-400 shrink-0" size={16} />
                        <span className="text-gray-800 truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                        <span className="text-gray-400 text-[10px]">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-full transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={loading}
                    className="flex-1 bg-[#A10B13] hover:bg-[#83090F] text-white py-3 rounded-2xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md shadow-red-200/50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Processing Images...
                      </>
                    ) : (
                      '✓ Import Selected Images'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: configuration options & instructions */}
          <div className="space-y-6">
            
            {/* Import options */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-gray-900">Import Options</h3>
              
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  className="mt-1 accent-[#A10B13]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Replace existing images</span>
                  <span className="text-[10px] text-gray-400 font-semibold leading-normal block mt-0.5">
                    If checked, overwrites existing product image links in DB. Otherwise, products with existing images are skipped.
                  </span>
                </div>
              </label>
            </div>

            {/* Helper guide */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                <Info className="text-blue-600" size={16} />
                <h3>How batch import works</h3>
              </div>
              <ol className="list-decimal pl-4.5 text-[11px] text-gray-500 font-semibold space-y-2">
                <li>Rename product images to their exact SAP code, e.g. <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">TONCP23.jpg</code>.</li>
                <li>MIME validation filters out non-image files. Only JPG, PNG, and WebP are allowed.</li>
                <li>The system matches filenames to active SAP codes. Unknown codes are skipped.</li>
                <li>Images are optimized (scaled to max 600px width/height and compressed to WebP) for fast page loading.</li>
                <li>The output updates only the matched product's <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">image_url</code> field.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Upload Summary Report */}
        {report && (
          <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-extrabold text-gray-900 text-base">Upload Report Summary</h3>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <span className="text-green-600">Uploaded: {report.uploaded}</span>
                <span className="text-amber-600">Skipped: {report.skipped}</span>
                <span className="text-red-600">Failed: {report.failed}</span>
              </div>
            </div>

            {report.details.length === 0 ? (
              <p className="text-xs text-gray-400 font-semibold">No files were processed.</p>
            ) : (
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">File Name</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Extracted SAP</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Note / Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                    {report.details.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3">{item.fileName}</td>
                        <td className="px-4 py-3 font-mono font-bold text-gray-600">{item.sapCode || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            item.status === 'uploaded'
                              ? 'bg-green-50 text-green-700 border border-green-100/50'
                              : item.status === 'skipped'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100/50'
                              : 'bg-red-50 text-red-700 border border-red-100/50'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-left text-[11px] ${item.status === 'failed' ? 'text-red-600' : 'text-gray-400'}`}>
                          {item.reason || 'Successfully matched & uploaded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
