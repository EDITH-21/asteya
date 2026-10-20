import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AadrutLogo } from "@/components/ui/AadrutLogo";
import { ArrowLeft } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | Aadrut",
  description: "Aadrut's commitment to protecting user privacy, data security, and client confidentiality.",
  alternates: {
    canonical: "https://asteya.tech/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#05070b] text-[#f1f5f9] flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#05070b]/80 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg p-1"
            aria-label="Return to Aadrut homepage"
          >
            <AadrutLogo heightClass="h-[40px] sm:h-[46px]" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Return Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
              <span>Legal Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              Privacy Policy
            </h1>
            <p className="text-sm font-sans text-slate-400">
              Last updated: October 2026 &bull; Effective immediately
            </p>
          </div>

          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">1. Commitment to Privacy</h2>
              <p>
                Aadrut (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is dedicated to safeguarding the privacy and confidential data of our website visitors, clients, and partners. This policy outlines how we collect, handle, and protect information submitted across our digital platforms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">2. Information We Collect</h2>
              <p>
                When you interact with our website or submit an inquiry, we collect only the necessary information to provide our services and respond to your requests:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li><strong className="text-slate-200">Contact Details:</strong> Your name, work email address, and company affiliation.</li>
                <li><strong className="text-slate-200">Project Overview:</strong> Technical briefs, engagement domains, timeline requirements, and project descriptions.</li>
                <li><strong className="text-slate-200">Technical Data:</strong> Anonymized server logs, browser type, and IP address collected strictly for security rate limiting and fraud prevention.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">3. How Information is Used</h2>
              <p>
                All data collected is used solely to evaluate technical scope, respond to business inquiries, execute consulting agreements, and ensure the security of our platforms. We never sell, rent, or trade personal data to third parties or advertising networks.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">4. Data Retention &amp; Security</h2>
              <p>
                We employ strict industry-standard technical measures, including cryptographic token verification, sanitized parameterized queries, strict Content Security Policies, and access control restrictions to prevent unauthorized access or disclosure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">5. Contact &amp; Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data at any time by contacting our engineering and leadership team at{" "}
                <a href={`mailto:${CONTACT_CONFIG.email}`} className="text-indigo-400 hover:underline">
                  {CONTACT_CONFIG.email}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#030508] border-t border-white/[0.08] py-8 text-slate-400 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; 2026 Aadrut. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/#contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
