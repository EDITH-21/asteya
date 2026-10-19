import React from "react";
import Link from "next/link";
import { AsteyaLogo } from "@/components/ui/AsteyaLogo";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05070b] text-[#f1f5f9] flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-white/[0.08] bg-[#05070b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <AsteyaLogo size={36} showText={true} />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Return to Safety</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Display */}
      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-400 font-mono text-xs">
            <span>404 &bull; Coordinate Not Found</span>
          </div>

          <h1 className="text-6xl sm:text-8xl font-black font-mono tracking-tighter text-white">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Page Lost in Digital Space
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The resource or route you are attempting to access does not exist or has been relocated to another vector.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-normal hover:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/#services"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/15 transition-all text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Explore Services</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.08] py-6 text-center text-xs font-sans text-slate-500">
        &copy; 2026 Asteya. All rights reserved.
      </footer>
    </div>
  );
}
