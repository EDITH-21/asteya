import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DETAILED_SERVICES } from "@/lib/services-data";
import { CONTACT_CONFIG } from "@/lib/constants";
import { AadrutLogo } from "@/components/ui/AadrutLogo";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(DETAILED_SERVICES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = DETAILED_SERVICES[slug];

  if (!service) {
    return {
      title: "Service Not Found | Aadrut",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asteya.tech";
  const url = `${siteUrl}/services/${service.slug}`;

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: url,
      siteName: "Aadrut",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: service.metaTitle,
      description: service.metaDescription,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = DETAILED_SERVICES[slug];

  if (!service) {
    notFound();
  }

  const otherServices = Object.values(DETAILED_SERVICES).filter((s) => s.slug !== slug);

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f1f5f9] flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-[#05070b]/80 backdrop-blur-md border-b border-white/[0.08]">
        <div className="site-container h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg p-1"
            aria-label="Return to Aadrut homepage"
          >
            <AadrutLogo heightClass="h-[40px] sm:h-[46px]" />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/#services"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>All Services</span>
            </Link>

            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 sm:px-5 py-2 rounded-full bg-white text-black text-xs sm:text-sm font-semibold tracking-normal hover:bg-slate-100 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          {/* Breadcrumb & Section Identifier */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-sans text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">
                Aadrut
              </Link>
              <span>/</span>
              <Link href="/#services" className="hover:text-white transition-colors">
                Services
              </Link>
              <span>/</span>
              <span className="text-indigo-300 font-medium">{service.title}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Service {service.number} &bull; Aadrut Capabilities</span>
            </div>

            {/* Single Semantic H1 */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.12]">
              {service.h1}
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-xl text-indigo-200/90 font-normal leading-relaxed max-w-3xl">
              {service.tagline}
            </p>
          </div>

          {/* Overview Section */}
          <section aria-labelledby="service-overview" className="space-y-6">
            <h2 id="service-overview" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Overview &amp; Purpose
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-4xl">
              {service.overview.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Core Benefits */}
          <section aria-labelledby="service-benefits" className="space-y-6">
            <h2 id="service-benefits" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Why Partner With Aadrut
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {service.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/30 transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                    {idx === 0 ? <Zap className="w-5 h-5" /> : idx === 1 ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Deliverables */}
          <section aria-labelledby="service-deliverables" className="space-y-6">
            <h2 id="service-deliverables" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Key Deliverables
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {service.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] space-y-2 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-2 text-indigo-300 font-medium text-xs font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Deliverable {idx + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Technologies & Use Cases */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Technical Stack */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>Technologies &amp; Frameworks</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {service.technicalStack.map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Typical Use Cases */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Typical Use Cases</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {service.useCases.map((useCase, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Call to Action Box */}
          <section aria-labelledby="cta-heading" className="rounded-3xl bg-gradient-to-b from-indigo-950/40 via-indigo-900/10 to-white/[0.02] border border-indigo-500/30 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-sans text-xs font-medium">
              <span>Ready to Build</span>
            </div>

            <h2 id="cta-heading" className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase max-w-2xl mx-auto">
              Let&apos;s Build Your Next {service.title} Project
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Partner with Aadrut to architect, engineer, and deploy resilient digital systems built for modern velocity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/#contact"
                className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm tracking-normal hover:bg-slate-100 transition-all duration-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span>Start a Conversation</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(`Inquiry about ${service.title}`)}`}
                className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/15 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span>Email Our Team</span>
              </a>
            </div>
          </section>

          {/* Explore Other Services */}
          <section aria-labelledby="other-services" className="space-y-6 pt-4 border-t border-white/[0.08]">
            <h2 id="other-services" className="text-lg font-bold text-white tracking-tight">
              Explore Other Core Capabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherServices.slice(0, 3).map((other) => (
                <Link
                  key={other.slug}
                  href={`/services/${other.slug}`}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-500 group-hover:text-indigo-400 transition-colors">
                      {other.number}
                    </span>
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                      {other.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {other.tagline}
                    </p>
                  </div>
                  <div className="pt-3 flex items-center gap-1 text-xs text-indigo-400 font-medium">
                    <span>Learn more</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Service Page Footer */}
      <footer className="w-full bg-[#030508] border-t border-white/[0.08] py-8 text-slate-400 text-xs font-sans">
        <div className="site-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              &copy; 2026 Aadrut. All rights reserved.
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/#contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
