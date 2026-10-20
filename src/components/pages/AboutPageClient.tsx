"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Palette,
  Bot,
  Globe2,
  Lightbulb,
  Search,
  Compass,
  ShieldCheck,
  Rocket,
  Zap,
} from "lucide-react";
import { useContactModal } from "@/components/layout/PublicLayout";
import type { AboutContent, TeamMember } from "@/lib/server/content-types";

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

const FORBIDDEN_TITLES_REGEX = /\b(ceo|cto|coo|chief\s+executive|chief\s+technology|chief\s+operating)\b/i;

function sanitizeRole(role: string): string {
  if (FORBIDDEN_TITLES_REGEX.test(role)) {
    return "Leadership";
  }
  return role;
}

// Grounded in existing site services data (DETAILED_SERVICES)
const CORE_SERVICES = [
  {
    num: "01",
    title: "Web Development",
    tagline: "Modern, responsive, and scalable web platforms engineered for longevity.",
    href: "/services/web-development",
    icon: Code2,
  },
  {
    num: "02",
    title: "Digital Solutions",
    tagline: "Targeted engineering resolving complex operational bottlenecks.",
    href: "/services/digital-solutions",
    icon: Cpu,
  },
  {
    num: "03",
    title: "Brand & Design",
    tagline: "Strategic visual identities and consistent digital design systems.",
    href: "/services/brand-design",
    icon: Palette,
  },
  {
    num: "04",
    title: "Business Automation",
    tagline: "Autonomous workflows and custom operational pipelines.",
    href: "/services/business-automation",
    icon: Bot,
  },
  {
    num: "05",
    title: "Digital Presence",
    tagline: "Comprehensive search visibility, technical SEO, and conversion optimization.",
    href: "/services/digital-presence",
    icon: Globe2,
  },
  {
    num: "06",
    title: "Technology Consulting",
    tagline: "Architectural advisory, technology audits, and systems modernizations.",
    href: "/services/technology-consulting",
    icon: Lightbulb,
  },
];

// Grounded in existing site process stages (UNIFIED_PROCESS_STAGES)
const PROCESS_STAGES = [
  {
    step: "01",
    name: "Discover & Strategy",
    summary: "Deconstructing domain requirements, analyzing user needs, and establishing architecture milestones.",
    icon: Search,
  },
  {
    step: "02",
    name: "Design & Systems",
    summary: "Crafting intuitive UX workflows, responsive design systems, and interactive component prototypes.",
    icon: Compass,
  },
  {
    step: "03",
    name: "Precision Engineering",
    summary: "Building robust, type-safe full-stack software with modern frameworks, clean APIs, and scalable infrastructure.",
    icon: Code2,
  },
  {
    step: "04",
    name: "Validation & QA",
    summary: "Automated end-to-end testing, security audits, accessibility compliance, and cross-device verification.",
    icon: ShieldCheck,
  },
  {
    step: "05",
    name: "Launch & Evolution",
    summary: "Structured deployment, real-time observability, and ongoing iterative improvements based on user telemetry.",
    icon: Rocket,
  },
];

interface AboutPageClientProps {
  about: AboutContent;
  team: TeamMember[];
}

export const AboutPageClient: React.FC<AboutPageClientProps> = ({ about, team }) => {
  const { openContactModal } = useContactModal();

  const values =
    about.values && about.values.length > 0
      ? about.values
      : [
          {
            title: "Precision Engineering",
            text: "High-speed, scalable, modern architectural foundations built for longevity and maintainability.",
          },
          {
            title: "Intelligent Velocity",
            text: "Autonomous workflows and rapid continuous product deployment loops without compromising stability.",
          },
          {
            title: "Transparent Ownership",
            text: "Complete source code transfer, clean documentation, and honest technical collaboration at every phase.",
          },
          {
            title: "Human Utility",
            text: "Technology exists to solve real problems and empower human capabilities.",
          },
        ];

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden border-b border-white/[0.04]">
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] sm:w-[540px] h-[220px] bg-indigo-600/10 rounded-full blur-2xl sm:blur-[120px] pointer-events-none" />

        <div className="site-container relative z-10 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Company &bull; Purpose</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.08]">
            About Aadrut
          </h1>

          <p className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
            Aadrut is a technology company creating digital products, intelligent solutions, and ventures designed for the future.
          </p>
        </div>
      </section>

      {/* 2. About Aadrut Details */}
      <div className="space-y-12 sm:space-y-16 py-12 sm:py-16">
        {/* Subsection A: What We Do (6 Core Services) */}
        <section className="site-container">
          <div className="max-w-3xl mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
              <span>01 &bull; Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              What We Do
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Comprehensive digital engineering disciplines designed to take products from concept to high-scale execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {CORE_SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all group flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono text-slate-500 group-hover:text-indigo-400 transition-colors">
                        {service.num}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-200 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                      {service.tagline}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-1.5 text-xs text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Explore practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Subsection B: How We Work (Execution Methodology) */}
        <section className="site-container">
          <div className="max-w-3xl mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
              <span>02 &bull; Methodology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              How We Work
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              A transparent, iterative 5-stage engineering pipeline built for velocity and resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {PROCESS_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3 relative hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      Stage {stage.step}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {stage.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {stage.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Subsection C: What We Value (Operating Values) */}
        <section className="site-container">
          <div className="max-w-3xl mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
              <span>03 &bull; Principles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              What We Value
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Core operating principles that guide our technical decisions, codebase standards, and client stewardship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-indigo-500/20 transition-colors"
              >
                <div className="flex items-center gap-2 text-indigo-300 font-sans text-sm font-semibold">
                  {i === 0 ? (
                    <Cpu strokeWidth={1.75} className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : i === 1 ? (
                    <Zap strokeWidth={1.75} className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <Layers strokeWidth={1.75} className="w-4 h-4 text-violet-400 shrink-0" />
                  )}
                  <span>{v.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{v.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 3. Our Team Section */}
      {team.length > 0 && (
        <section className="site-section relative py-12 sm:py-16 border-t border-white/[0.04] bg-[#05070b]">
          <div className="site-container">
            <div className="max-w-3xl mb-8 sm:mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
                <span>Our Team</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase">
                The people behind Aadrut
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {team.map((member) => {
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const safeRole = sanitizeRole(member.displayRole);

                return (
                  <div
                    key={member.id}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between hover:border-indigo-500/30 transition-colors group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        {member.photoUrl ? (
                          <Image
                            src={member.photoUrl}
                            alt={member.name}
                            width={56}
                            height={56}
                            unoptimized
                            className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-500/20 border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                            {initials}
                          </div>
                        )}

                        {member.linkedinUrl && (
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                            aria-label={`${member.name}'s LinkedIn profile`}
                          >
                            <LinkedInIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-white tracking-tight">
                          {member.name}
                        </h3>
                        <p className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-medium">
                          {safeRole}
                        </p>
                      </div>

                      {member.bio && (
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. CTA Section */}
      <section className="site-section relative py-12 sm:py-16 border-t border-white/[0.04]">
        <div className="site-container max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-indigo-950/30 to-white/[0.02] border border-indigo-500/20 text-center space-y-5">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">
              Have a project in mind?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
              Let&apos;s discuss your requirements and build dependable digital systems for your business.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={openContactModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-100 transition-all duration-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span>Contact Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
