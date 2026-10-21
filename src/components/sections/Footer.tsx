"use client";

import React from "react";
import Link from "next/link";
import { AadrutLogo } from "../ui/AadrutLogo";
import { Mail } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants";
import type { SiteSettings } from "@/lib/server/content-types";

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
  settings?: SiteSettings;
  hasFaqs?: boolean;
  hasVentures?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenContact,
  settings,
  hasFaqs = false,
  hasVentures = false,
}) => {
  const email = settings?.contactEmail || CONTACT_CONFIG.email;
  const instagram = settings?.instagramUrl || CONTACT_CONFIG.instagram;
  const linkedin = settings?.linkedinUrl || CONTACT_CONFIG.linkedin;
  const tagline = settings?.footerTagline || "IDEA ───── BUILD ───── EVOLVE";

  const handleContactClick = (e: React.MouseEvent) => {
    if (onOpenContact) {
      e.preventDefault();
      onOpenContact();
      return;
    }
    const target = document.querySelector("#contact");
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#030508] border-t border-white/[0.06] py-10 md:py-14 text-slate-300">
      <div className="site-container">
        {/* Top Section: Brand Block + 4 Columns (5 Columns on Desktop, 2 on Tablet, 1 Stacked on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Left Brand Block (Desktop col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/"
              aria-label="Aadrut Home"
              className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg"
            >
              <AadrutLogo heightClass="h-[44px] md:h-[50px]" />
            </Link>

            <p className="font-bold text-white text-base sm:text-lg tracking-tight">
              Building what&apos;s next.
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Intelligent digital products, scalable technology architectures, and future ventures.
            </p>

            <div className="pt-1">
              <a
                href="#contact"
                onClick={handleContactClick}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors py-2 min-h-[44px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
              >
                <span>Start a Conversation</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </a>
            </div>

            {/* Social Channels (44px tap targets) */}
            <div className="flex items-center gap-3 pt-1">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  aria-label="Visit Aadrut on Instagram"
                >
                  <InstagramIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  aria-label="Visit Aadrut on LinkedIn"
                >
                  <LinkedInIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              )}
            </div>
          </div>

          {/* Column 1: SERVICES (Desktop col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">
              SERVICES
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link
                  href="/services/web-development"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Web Development
                </Link>
              </li>
              <li>
                <Link
                  href="/services/digital-solutions"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Digital Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="/services/brand-design"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Brand &amp; Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/business-automation"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Business Automation
                </Link>
              </li>
              <li>
                <Link
                  href="/services/digital-presence"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Digital Presence
                </Link>
              </li>
              <li>
                <Link
                  href="/services/technology-consulting"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Technology Consulting
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: COMPANY (Desktop col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">
              COMPANY
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link
                  href="/about"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Our Team
                </Link>
              </li>
              {hasVentures && (
                <li>
                  <Link
                    href="/#ventures"
                    className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                  >
                    Ventures
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/#process"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Process
                </Link>
              </li>
              <li>
                <Link
                  href="/#technology"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/#why-aadrut"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Why Aadrut
                </Link>
              </li>
              {hasFaqs && (
                <li>
                  <Link
                    href="/faq"
                    className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                  >
                    FAQ
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: LEGAL (Desktop col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">
              LEGAL
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link
                  href="/privacy"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-flex items-center min-h-[40px] sm:min-h-[32px] text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONNECT (Desktop col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">
              CONNECT
            </h3>
            <div className="space-y-3 text-xs">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors group min-h-[44px] py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                aria-label={`Send email to ${email}`}
              >
                <Mail strokeWidth={1.75} className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="break-all">{email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider Row with Centered Mono Tagline */}
        <div className="my-8 md:my-10 flex items-center justify-center gap-2 sm:gap-4">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <div className="text-[10px] sm:text-xs font-mono tracking-[0.18em] sm:tracking-[0.25em] text-slate-400 uppercase select-none whitespace-nowrap px-1">
            {tagline}
          </div>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-400">
          {/* Left Copyright */}
          <div className="text-center sm:text-left">
            &copy; 2026 Aadrut. All rights reserved.
          </div>

          {/* Center Brand Pillars */}
          <div className="text-center text-slate-400 text-[11px] sm:text-xs tracking-wide">
            Digital Products &bull; Intelligent Solutions &bull; Future Ventures
          </div>

          {/* Right Compact Legal Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
            >
              Privacy Policy
            </Link>
            <span>&middot;</span>
            <Link
              href="/terms"
              className="hover:text-white transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
