'use client'

import { useState } from 'react'
import { Copy, Download, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Verification } from '@/types'

interface ResultsCardProps {
  verification: Verification
  onReset: () => void
}

export function ResultsCard({ verification, onReset }: ResultsCardProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const isAI = verification.status === 'ai-generated'
  const statusColor = isAI ? 'text-[#dc2626]' : 'text-[#16a34a]'
  const badgeBg = isAI ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
  const badgeText = isAI ? 'AI GENERATED' : 'HUMAN CREATED'

  const copyHash = () => {
    navigator.clipboard.writeText(verification.hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Copied',
      description: 'Hash copied to clipboard',
    })
  }

  const downloadWatermarked = () => {
    toast({
      title: 'Download starting',
      description: 'Your watermarked image is being prepared',
    })
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Status Badge */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${badgeBg}`}>
        {isAI ? (
          <AlertCircle size={24} className="text-[#dc2626]" />
        ) : (
          <CheckCircle size={24} className="text-[#16a34a]" />
        )}
        <div>
          <p className={`font-bold text-lg ${statusColor}`}>{badgeText}</p>
          <p className="text-sm text-[#9ca3af]">Confidence: {verification.confidence}%</p>
        </div>
      </div>

      {/* Confidence Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#9ca3af]">Confidence Level</span>
          <span className="font-mono text-white">{verification.confidence}%</span>
        </div>
        <div className="w-full h-2 bg-[#262626] rounded-full overflow-hidden border border-[#404040]">
          <div
            className={`h-full transition-all duration-500 ${
              isAI ? 'bg-gradient-to-r from-[#dc2626] to-red-500' : 'bg-gradient-to-r from-[#16a34a] to-green-500'
            }`}
            style={{ width: `${verification.confidence}%` }}
          />
        </div>
      </div>

      {/* Blockchain Hash */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">Blockchain Verification Hash</span>
          <Info size={16} className="text-[#6b7280]" title="This hash is stored on a public ledger for verification" />
        </div>
        <div className="flex gap-2">
          <code className="flex-1 bg-[#0f0f0f] border border-[#404040] rounded-lg p-3 font-mono text-xs text-[#9ca3af] overflow-x-auto break-all">
            {verification.hash}
          </code>
          <button
            onClick={copyHash}
            className="px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg hover:border-[#6b7280] transition-colors duration-200 flex items-center gap-2 text-[#9ca3af] hover:text-white"
            title="Copy hash"
          >
            <Copy size={16} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Timestamp */}
      <div className="p-3 bg-[#0f0f0f] border border-[#404040] rounded-lg text-sm">
        <p className="text-[#6b7280]">
          Verified on: <span className="text-white font-mono">{formatDate(verification.timestamp)}</span>
        </p>
      </div>

      {/* Download Button (Image only) */}
      {verification.type === 'image' && (
        <button
          onClick={downloadWatermarked}
          className="w-full px-6 py-3 bg-[#dc2626] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Download Watermarked Image
        </button>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full px-6 py-2 border border-[#404040] text-[#9ca3af] font-semibold rounded-lg hover:border-[#6b7280] hover:text-white transition-colors duration-200"
      >
        Analyze Another {verification.type === 'image' ? 'Image' : 'Text'}
      </button>
    </div>
  )
}
