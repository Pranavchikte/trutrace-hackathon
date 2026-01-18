'use client'

import { useState, useEffect } from 'react'

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] py-20 border-b border-[#404040]">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Logo/Badge */}
          <div className="inline-block mb-6 px-4 py-2 bg-[#262626] border border-[#404040] rounded-lg hover:border-[#dc2626] transition-colors duration-300">
            <span className="text-2xl">🇮🇳</span>
            <span className="ml-2 font-mono font-bold text-[#dc2626]">भारत MARK</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight text-balance">
            <span className="text-white">TruTrace: </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc2626] to-red-500">
              Verify Digital Truth
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-[#9ca3af] mb-6 max-w-3xl mx-auto text-balance">
            Combat deepfakes and AI-generated misinformation with India's Bharat Mark compliance
          </p>

          {/* Problem Statement */}
          <p className="text-lg text-[#6b7280] max-w-2xl mx-auto text-balance">
            In the age of AI, seeing is no longer believing. Protect yourself from synthetic media fraud.
          </p>
        </div>
      </div>
    </header>
  )
}
