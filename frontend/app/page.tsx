'use client'

import { useState } from 'react'
import { HeroSection } from '@/components/hero-section'
import { DetectionTabs } from '@/components/detection-tabs'
import { VerificationLedger } from '@/components/verification-ledger'
import { Footer } from '@/components/footer'
import type { Verification } from '@/types'

export default function Home() {
  const [verifications, setVerifications] = useState<Verification[]>([])

  const addVerification = (verification: Verification) => {
    setVerifications((prev) => [verification, ...prev.slice(0, 9)])
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <HeroSection />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <DetectionTabs onVerification={addVerification} />
        <VerificationLedger verifications={verifications} />
      </main>
      <Footer />
    </div>
  )
}
