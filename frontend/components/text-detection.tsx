'use client'

import { useState } from 'react'
import { ResultsCard } from './results-card'
import { useToast } from '../hooks/use-toast'
import type { Verification } from '@/types'

interface TextDetectionTabProps {
  onVerification: (verification: Verification) => void
}

export function TextDetectionTab({ onVerification }: TextDetectionTabProps) {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<Verification | null>(null)
  const { toast } = useToast()

  const analyzeText = async () => {
  if (!text.trim()) {
    toast({
      title: 'Empty text',
      description: 'Please paste some text to analyze',
      variant: 'destructive',
    })
    return
  }

  setIsAnalyzing(true)

  try {
    const formData = new URLSearchParams()
    formData.append('text', text)

    const response = await fetch('/api/detect-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Detection failed')
    }

    const data = await response.json()

    const verification: Verification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      status: data.is_ai_generated ? 'ai-generated' : 'human-created',
      confidence: Math.round(data.confidence * 100),
      hash: data.blockchain_hash,
      timestamp: new Date().toISOString(),
    }

    setResult(verification)
    onVerification(verification)

    toast({
      title: 'Analysis complete',
      description: `Text verified: ${verification.status === 'ai-generated' ? 'AI Generated' : 'Human Created'}`,
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to analyze text. Make sure backend is running.',
      variant: 'destructive',
    })
  } finally {
    setIsAnalyzing(false)
  }
}

  if (result) {
    return (
      <div className="space-y-6">
        <div className="bg-[#262626] border border-[#404040] rounded-lg p-6">
          <p className="text-[#9ca3af] mb-4 line-clamp-3">{text}</p>
        </div>
        <ResultsCard verification={result} onReset={() => { setText(''); setResult(null); }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text content to analyze..."
          className="w-full h-56 bg-[#262626] border border-[#404040] rounded-lg p-4 text-white placeholder-[#6b7280] focus:border-[#dc2626] focus:outline-none resize-none transition-colors duration-200"
        />
        <p className="text-sm text-[#6b7280]">{text.length} characters</p>
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyzeText}
        disabled={isAnalyzing || !text.trim()}
        className="w-full px-6 py-3 bg-[#dc2626] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Analyzing...
          </>
        ) : (
          'Analyze Text'
        )}
      </button>
    </div>
  )
}
