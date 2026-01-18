'use client'

export function Footer() {
  return (
    <footer className="border-t border-[#404040] bg-[#0a0a0a] py-8 mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">TruTrace</span>
            <span className="text-[#6b7280]">•</span>
            <span className="text-[#6b7280] text-sm">Digital Truth Verification</span>
          </div>

          {/* Footer Text */}
          <p className="text-center md:text-right text-sm text-[#6b7280]">
            Powered by <span className="text-white font-semibold">Gemini AI</span> & <span className="text-white font-semibold">Sightengine</span>
            {' '} • Compliant with IT Amendment Rules 2025
          </p>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 pt-6 border-t border-[#404040] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#6b7280]">
          <p>© 2025 TruTrace. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
