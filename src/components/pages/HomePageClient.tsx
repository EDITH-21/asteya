"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { Footer } from "@/components/sections/Footer";
import type { PublicSiteContent } from "@/lib/server/content-types";

// Lazy-load below-the-fold sections with next/dynamic to minimize initial mobile JS payload
const VenturesSection = dynamic(
  () => import("@/components/sections/VenturesSection").then((mod) => mod.VenturesSection),
  { ssr: true }
);

const TestimonialsSection = dynamic(
  () => import("@/components/sections/TestimonialsSection").then((mod) => mod.TestimonialsSection),
  { ssr: true }
);

const ProcessSection = dynamic(
  () => import("@/components/sections/ProcessSection").then((mod) => mod.ProcessSection),
  { ssr: true }
);

const TechnologySection = dynamic(
  () => import("@/components/sections/TechnologySection").then((mod) => mod.TechnologySection),
  { ssr: true }
);

const WhyAadrutSection = dynamic(
  () => import("@/components/sections/WhyAsteyaSection").then((mod) => mod.WhyAadrutSection),
  { ssr: true }
);

const FaqSection = dynamic(
  () => import("@/components/sections/FaqSection").then((mod) => mod.FaqSection),
  { ssr: true }
);

const PhilosophySection = dynamic(
  () => import("@/components/sections/PhilosophySection").then((mod) => mod.PhilosophySection),
  { ssr: true }
);

const CtaSection = dynamic(
  () => import("@/components/sections/CtaSection").then((mod) => mod.CtaSection),
  { ssr: true }
);

const ContactModal = dynamic(
  () => import("@/components/ui/ContactModal").then((mod) => mod.ContactModal),
  { ssr: false }
);

interface HomePageClientProps {
  content: PublicSiteContent;
}

export const HomePageClient: React.FC<HomePageClientProps> = ({ content }) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleOpenContact = () => {
    setContactModalOpen(true);
  };

  const handleCloseContact = () => {
    setContactModalOpen(false);
  };

  return (
    <main className="relative min-h-[100svh] bg-[#05070b] text-[#f1f5f9] overflow-x-hidden">
      {/* Background Subtle Atmosphere */}
      <div className="fixed inset-0 bg-grid-subtle pointer-events-none z-0 opacity-30" />

      {/* Floating Navigation */}
      <Navbar onOpenContact={handleOpenContact} />

      {/* 1. Cinematic Hero */}
      <Hero onOpenContact={handleOpenContact} />

      {/* 2. Editorial About Section with Dynamic Leadership & Story */}
      <AboutSection about={content.about} team={content.team} />

      {/* 3. Core Services Panels (Linking to Dedicated Service Routes) */}
      <ServicesSection onOpenContact={handleOpenContact} />

      {/* 4. Ventures Spotlight: Attenza & Future Pipeline */}
      <VenturesSection ventures={content.ventures} />

      {/* 5. Client Testimonials (Controlled via Admin toggle & data) */}
      <TestimonialsSection
        testimonials={content.testimonials}
        showTestimonials={content.settings.showTestimonials}
      />

      {/* 6. Concept to Reality: Unified 5-Stage Engineering Process */}
      <ProcessSection />

      {/* 7. Built For The Future: Interactive Technology System */}
      <TechnologySection />

      {/* 8. Why Aadrut: Purpose-Driven Architecture */}
      <WhyAadrutSection />

      {/* 9. FAQ Section: Published knowledgebase answers */}
      <FaqSection faqs={content.faqs} />

      {/* 10. Minimalist Philosophy Climax Statement */}
      <PhilosophySection />

      {/* 11. Direct In-Page Contact & Inquiry Form */}
      <CtaSection onOpenContact={handleOpenContact} />

      {/* 12. Minimalist Dynamic Footer */}
      <Footer onOpenContact={handleOpenContact} settings={content.settings} />

      {/* Interactive Contact & Inquiry Modal */}
      {contactModalOpen && (
        <ContactModal
          isOpen={contactModalOpen}
          onClose={handleCloseContact}
        />
      )}
    </main>
  );
};
