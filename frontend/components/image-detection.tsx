'use client'

import React from "react"

import { useState, useRef } from 'react'
import { Upload, Copy, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { ResultsCard } from './results-card'
import { useToast } from '../hooks/use-toast'
import type { Verification } from '@/types'

interface ImageDetectionTabProps {
  onVerification: (verification: Verification) => void
}

export function ImageDetectionTab({ onVerification }: ImageDetectionTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<Verification | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-[#dc2626]', 'bg-red-500/5')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-[#dc2626]', 'bg-red-500/5')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-[#dc2626]', 'bg-red-500/5')
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const analyzeImage = async () => {
  if (!selectedFile) return

  setIsAnalyzing(true)

  try {
    const formData = new FormData()
    formData.append('file', selectedFile)

    const response = await fetch('/api/detect-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Detection failed')
    }

    // Check if response is JSON or image
    const contentType = response.headers.get('content-type')
    
    let isAI: boolean
    let confidence: number
    let blockchainHash: string

    if (contentType?.includes('application/json')) {
      // Human image - JSON response
      const data = await response.json()
      isAI = data.is_ai_generated
      confidence = data.confidence
      blockchainHash = data.blockchain_hash
    } else {
      // AI image - headers only
      isAI = response.headers.get('X-AI-Detection') === 'true'
      confidence = parseFloat(response.headers.get('X-Confidence') || '0')
      blockchainHash = response.headers.get('X-Blockchain-Hash') || ''
    }

    const verification: Verification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
      status: isAI ? 'ai-generated' : 'human-created',
      confidence: Math.round(confidence * 100),
      hash: blockchainHash,
      timestamp: new Date().toISOString(),
    }

    setResult(verification)
    onVerification(verification)

    toast({
      title: 'Analysis complete',
      description: `Image verified: ${verification.status === 'ai-generated' ? 'AI Generated' : 'Human Created'}`,
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to analyze image. Make sure backend is running.',
      variant: 'destructive',
    })
  } finally {
    setIsAnalyzing(false)
  }
}

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#404040] rounded-lg p-12 text-center cursor-pointer transition-all duration-300 hover:border-[#6b7280] bg-[#0f0f0f]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-[#262626] rounded-lg">
              <Upload size={32} className="text-[#dc2626]" />
            </div>
            <div>
              <p className="text-xl font-semibold text-white mb-2">Drop image here or click to upload</p>
              <p className="text-[#6b7280]">Supports PNG, JPG, WebP (max 10MB)</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-6 py-2 bg-[#dc2626] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Choose File
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="max-w-100 max-h-100 rounded-lg border border-[#404040] object-contain"
            />
          </div>

          {/* Analyze Button */}
          {!result && (
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full px-6 py-3 bg-[#dc2626] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                'Analyze Image'
              )}
            </button>
          )}

          {/* Results */}
          {result && <ResultsCard verification={result} onReset={() => { setPreview(null); setResult(null); }} />}

          {/* Change Image */}
          {!result && (
            <button
              onClick={() => { setPreview(null); setSelectedFile(null); }}
              className="w-full px-6 py-2 border border-[#404040] text-[#9ca3af] font-semibold rounded-lg hover:border-[#6b7280] transition-colors duration-200"
            >
              Choose Different Image
            </button>
          )}
        </div>
      )}
    </div>
  )
}
