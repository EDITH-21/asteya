"use client";

import React from "react";
import { AsteyaLogo } from "../ui/AsteyaLogo";
import { ArrowUp, Terminal, Shield } from "lucide-react";

interface FooterProps {
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#030508] border-t border-white/10 py-16 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 pb-12 border-b border-white/5">
          {/* Brand Info */}
          <div className="space-y-3">
            <AsteyaLogo size={36} showText={true} />
            <p className="text-sm text-slate-400 font-normal">
              Building what&apos;s next.
            </p>
          </div>

          {/* Clean Navigation Links */}
          <nav className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-mono tracking-widest uppercase">
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
              className="text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Scroll To Top */}
          <button
            onClick={scrollToTop}
            data-cursor="TOP"
            className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-400/50 transition-all shadow-sm"
            aria-label="Scroll back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-600">
          <div>
            &copy; 2026 Asteya. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>SYSTEMS: ONLINE</span>
            </div>
            <span>//</span>
            <span>VENTURES &amp; INTELLIGENT TECH</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
