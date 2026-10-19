"use client";

import React from "react";
import Link from "next/link";
import { AsteyaLogo } from "../ui/AsteyaLogo";
import { ArrowUp, Mail } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants";

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface FooterProps {
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactClick = (e: React.MouseEvent) => {
    if (onOpenContact) {
      e.preventDefault();
      onOpenContact();
    }
  };

  return (
    <footer className="w-full bg-[#030508] border-t border-white/[0.08] py-12 sm:py-14 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand & Tagline */}
          <div className="space-y-2 max-w-sm">
            <Link href="/" aria-label="Asteya Home">
              <AsteyaLogo size={34} showText={true} />
            </Link>
            <p className="text-sm text-slate-400 font-normal pl-0.5">
              Building what&apos;s next. Intelligent digital products, scalable technology architectures, and future ventures.
            </p>
          </div>

          {/* Direct Contact & Social Links */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Email Contact Link */}
            <a
              href={`mailto:${CONTACT_CONFIG.email}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/40 text-slate-300 hover:text-white text-xs font-sans font-medium transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              aria-label={`Send email to ${CONTACT_CONFIG.email}`}
            >
              <Mail strokeWidth={1.75} className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>{CONTACT_CONFIG.email}</span>
            </a>

            {/* Social Channels */}
            <div className="flex items-center gap-2">
              {/* Instagram */}
              <a
                href={CONTACT_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-pink-500/40 flex items-center justify-center text-slate-300 hover:text-pink-300 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                aria-label="Visit Asteya on Instagram"
              >
                <InstagramIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>

              {/* LinkedIn */}
              <a
                href={CONTACT_CONFIG.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-blue-400/40 flex items-center justify-center text-slate-300 hover:text-blue-300 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Visit Asteya on LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Navigation Links & Scroll to Top */}
          <div className="flex items-center gap-6 sm:gap-8">
            <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-sans font-medium tracking-normal text-slate-300">
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
              <a href="#process" className="hover:text-white transition-colors">
                Process
              </a>
              <a href="#technology" className="hover:text-white transition-colors">
                Technology
              </a>
              <a
                href="#contact"
                onClick={handleContactClick}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Scroll To Top */}
            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-400/50 hover:bg-white/[0.08] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shrink-0"
              aria-label="Scroll back to top"
            >
              <ArrowUp strokeWidth={1.75} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar with Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-400">
          <div className="flex items-center gap-4">
            <span>&copy; 2026 Asteya. All rights reserved.</span>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
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
