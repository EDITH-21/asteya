"use client";

import React from "react";
import Image from "next/image";
import { Target, Compass, Cpu, Zap, ArrowUpRight, Users, Sparkles } from "lucide-react";
import { useContactModal } from "@/components/layout/PublicLayout";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";
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
            text: "High-speed, scalable, modern architectural foundations built for longevity.",
          },
          {
            title: "Intelligent Velocity",
            text: "Autonomous workflows and rapid continuous product deployment loops.",
          },
          {
            title: "Technical Stewardship",
            text: "Direct ownership of every line of code without bureaucratic abstraction.",
          },
          {
            title: "Human Utility",
            text: "Technology exists to solve real problems and empower human capabilities.",
          },
        ];

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden border-b border-white/[0.04]">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] h-[280px] bg-indigo-600/10 rounded-full blur-2xl sm:blur-[140px] pointer-events-none" />

        <div className="site-container relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Company &bull; Purpose &amp; Stewardship</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.08]">
            {about.headline || "Technology should move humanity forward."}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
            Aadrut transforms ideas into high-performance digital systems, modern web architectures, and future technology ventures.
          </p>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="site-section relative py-16 sm:py-24 border-b border-white/[0.04]">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-4 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
                <span>01 &bull; Narrative</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase">
                Our Story
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Where engineering discipline meets entrepreneurial execution.
              </p>
            </div>

            <div className="lg:col-span-8 bg-[#090d16] border border-white/[0.08] rounded-2xl p-6 sm:p-10 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <SafeMarkdown content={about.story} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      {(about.mission || about.vision) && (
        <section className="site-section relative py-16 sm:py-24 border-b border-white/[0.04]">
          <div className="site-container">
            <div className="max-w-3xl mb-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
                <span>02 &bull; Trajectory</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase">
                Mission &amp; Vision
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {about.mission && (
                <div className="p-6 sm:p-8 rounded-2xl bg-[#090d16] border border-white/[0.08] space-y-4 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                    Our Mission
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {about.mission}
                  </p>
                </div>
              )}

              {about.vision && (
                <div className="p-6 sm:p-8 rounded-2xl bg-[#090d16] border border-white/[0.08] space-y-4 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                    Our Vision
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {about.vision}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. Values Section */}
      <section className="site-section relative py-16 sm:py-24 border-b border-white/[0.04]">
        <div className="site-container">
          <div className="max-w-3xl mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
              <span>03 &bull; Operating Values</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase">
              How We Operate
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              The non-negotiable principles that drive every architectural and product decision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors space-y-2.5"
              >
                <div className="flex items-center gap-2 text-indigo-300 font-sans text-sm font-semibold">
                  {i % 2 === 0 ? (
                    <Cpu strokeWidth={1.75} className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <Zap strokeWidth={1.75} className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <span>{v.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Team Section */}
      {team.length > 0 && (
        <section className="site-section relative py-16 sm:py-24 border-b border-white/[0.04]">
          <div className="site-container">
            <div className="max-w-3xl mb-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>04 &bull; Core Leadership</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase">
                The Minds Behind Aadrut
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Direct technical stewardship, precision execution, and dedicated accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="p-6 rounded-2xl bg-[#090d16] border border-white/[0.08] backdrop-blur-sm flex flex-col justify-between hover:border-indigo-500/30 transition-colors group"
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
                            className="p-2.5 rounded-xl bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                            aria-label={`${member.name} on LinkedIn`}
                          >
                            <LinkedInIcon className="w-4 h-4 text-indigo-400" />
                          </a>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-xs font-medium text-cyan-400 mt-0.5">
                          {safeRole}
                        </p>
                      </div>

                      {member.bio && (
                        <p className="text-xs text-slate-400 leading-relaxed pt-1">
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

      {/* 6. CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="site-container relative z-10 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase leading-tight">
            Ready to Build What&apos;s Next?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Whether you need modern digital product engineering, enterprise automation, or venture incubation, our team is ready to collaborate.
          </p>

          <div className="pt-2">
            <button
              onClick={openContactModal}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-sans text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Start a Conversation</span>
              <ArrowUpRight strokeWidth={2} className="w-4 h-4 text-indigo-200" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
