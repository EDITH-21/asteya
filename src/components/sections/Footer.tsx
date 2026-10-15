"use client";

import React from "react";
import { AsteyaLogo } from "../ui/AsteyaLogo";
import { ArrowUp } from "lucide-react";

interface FooterProps {
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#030508] border-t border-white/[0.08] py-14 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="space-y-2">
            <AsteyaLogo size={34} showText={true} />
            <p className="text-sm text-slate-400 font-normal pl-0.5">
              Building what&apos;s next.
            </p>
          </div>

          {/* Clean Navigation Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-sans font-medium tracking-normal text-slate-300">
            <a href="#" className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-white transition-colors">
              Services
            </a>
            <a href="#ventures" className="hover:text-white transition-colors">
              Ventures
            </a>
            <button
              onClick={onOpenContact}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Scroll To Top */}
          <button
            onClick={scrollToTop}
            data-cursor="TOP"
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-400/50 hover:bg-white/[0.08] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            aria-label="Scroll back to top"
          >
            <ArrowUp strokeWidth={1.75} className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-400">
          <div>
            &copy; 2026 Asteya. All rights reserved.
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Digital Products</span>
            <span>&bull;</span>
            <span>Intelligent Solutions</span>
            <span>&bull;</span>
            <span>Future Ventures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
