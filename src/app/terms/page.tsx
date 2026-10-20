import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AadrutLogo } from "@/components/ui/AadrutLogo";
import { ArrowLeft } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service | Aadrut",
  description: "Aadrut's terms and conditions governing the use of our website, consulting services, and digital products.",
  alternates: {
    canonical: "https://asteya.tech/terms",
  },
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-sm font-sans text-slate-400">
              Last updated: October 2026 &bull; Effective immediately
            </p>
          </div>

          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">1. Acceptance of Terms</h2>
              <p>
                By accessing and utilizing the Aadrut website or engaging our technology consulting and software engineering services, you agree to comply with and be bound by these Terms of Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">2. Intellectual Property</h2>
              <p>
                All original materials, codebases, design assets, and brand marks created by Aadrut prior to or independently of specific client engagements remain the intellectual property of Aadrut. Client deliverables are governed under individual Master Services Agreements (MSAs) or Statements of Work (SOWs).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">3. Client Engagements &amp; Deliverables</h2>
              <p>
                Specific scopes of work, milestones, payment schedules, and deliverable specifications are established in dedicated project agreements executed between Aadrut and the client.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">4. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Aadrut shall not be liable for indirect, incidental, special, consequential, or punitive damages resulting from the use of our website or software beyond the explicit terms outlined in active client contracts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">5. Inquiries &amp; Legal Notices</h2>
              <p>
                For legal notices or questions regarding these Terms, contact our legal and leadership team directly at{" "}
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/#contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
