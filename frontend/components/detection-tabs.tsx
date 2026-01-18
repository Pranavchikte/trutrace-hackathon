'use client'

import { useState } from 'react'
import { ImageIcon, FileText } from 'lucide-react'
import { ImageDetectionTab } from './image-detection'
import { TextDetectionTab } from './text-detection'
import type { Verification } from '@/types'

interface DetectionTabsProps {
  onVerification: (verification: Verification) => void
}

export function DetectionTabs({ onVerification }: DetectionTabsProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image')

  return (
    <div className="mb-12">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 border-b border-[#404040] relative">
        {/* Image Tab */}
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-lg transition-all duration-300 relative ${
            activeTab === 'image'
              ? 'text-white'
              : 'text-[#6b7280] hover:text-[#9ca3af]'
          }`}
        >
          <ImageIcon size={20} />
          <span>Image Detection</span>
          {activeTab === 'image' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dc2626] transition-all duration-300"></div>
          )}
        </button>

        {/* Text Tab */}
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-lg transition-all duration-300 relative ${
            activeTab === 'text'
              ? 'text-white'
              : 'text-[#6b7280] hover:text-[#9ca3af]'
          }`}
        >
          <FileText size={20} />
          <span>Text Detection</span>
          {activeTab === 'text' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#dc2626] transition-all duration-300"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'image' && <ImageDetectionTab onVerification={onVerification} />}
        {activeTab === 'text' && <TextDetectionTab onVerification={onVerification} />}
      </div>
    </div>
  )
}
