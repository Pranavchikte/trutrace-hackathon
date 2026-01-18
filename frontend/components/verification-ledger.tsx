'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Verification } from '@/types'

interface VerificationLedgerProps {
  verifications: Verification[]
}

export function VerificationLedger({ verifications }: VerificationLedgerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { toast } = useToast()

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    toast({
      title: 'Copied',
      description: 'Hash copied to clipboard',
    })
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const truncateHash = (hash: string, length = 12) => {
    return `${hash.slice(0, length)}...${hash.slice(-8)}`
  }

  if (verifications.length === 0) {
    return null
  }

  return (
    <div className="border border-[#404040] rounded-lg overflow-hidden bg-[#0f0f0f] mt-16">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-[#1a1a1a] transition-colors duration-200 cursor-pointer"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Recent Verifications</h2>
          <p className="text-sm text-[#6b7280]">{verifications.length} scan{verifications.length !== 1 ? 's' : ''} recorded</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-[#6b7280]" />
        ) : (
          <ChevronDown className="text-[#6b7280]" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-[#404040]">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-5 gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-[#404040] text-sm font-semibold text-[#9ca3af]">
            <div>Type</div>
            <div>Status</div>
            <div>Confidence</div>
            <div>Hash</div>
            <div>Time</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#404040]">
            {verifications.map((verification, index) => {
              const isAI = verification.status === 'ai-generated'
              const statusColor = isAI ? 'text-[#dc2626]' : 'text-[#16a34a]'
              const statusText = isAI ? 'AI Generated' : 'Human Created'
              const typeIcon = verification.type === 'image' ? '🖼️' : '📄'

              return (
                <div
                  key={verification.id}
                  className={`grid md:grid-cols-5 gap-4 px-6 py-4 items-center text-sm transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-[#0f0f0f]' : 'bg-[#1a1a1a]'
                  } hover:bg-[#262626]`}
                >
                  {/* Type */}
                  <div className="flex items-center gap-2 text-white">
                    <span>{typeIcon}</span>
                    <span className="capitalize font-medium">{verification.type}</span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`font-semibold ${statusColor}`}>{statusText}</span>
                  </div>

                  {/* Confidence */}
                  <div className="text-[#9ca3af]">{verification.confidence}%</div>

                  {/* Hash */}
                  <div className="flex items-center gap-2 group">
                    <code className="font-mono text-xs text-[#6b7280] bg-[#0f0f0f] px-2 py-1 rounded border border-[#404040]">
                      {truncateHash(verification.hash)}
                    </code>
                    <button
                      onClick={() => copyHash(verification.hash)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:text-white text-[#6b7280]"
                      title="Copy full hash"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  {/* Time */}
                  <div className="text-[#6b7280]">{formatDate(verification.timestamp)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
