"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { useContactModal } from "@/components/layout/PublicLayout";
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

const PhilosophySection = dynamic(
  () => import("@/components/sections/PhilosophySection").then((mod) => mod.PhilosophySection),
  { ssr: true }
);

const CtaSection = dynamic(
  () => import("@/components/sections/CtaSection").then((mod) => mod.CtaSection),
  { ssr: true }
);

interface HomePageClientProps {
  content: PublicSiteContent;
}

export const HomePageClient: React.FC<HomePageClientProps> = ({ content }) => {
  const { openContactModal } = useContactModal();

  return (
    <main className="w-full">
      {/* 1. Cinematic Hero */}
      <Hero onOpenContact={openContactModal} />

      {/* 2. Editorial About Section Teaser linking to /about */}
      <AboutSection about={content.about} />

      {/* 3. Core Services Panels (Linking to Dedicated Service Routes) */}
      <ServicesSection onOpenContact={openContactModal} />

      {/* 4. Ventures Spotlight: Attenza & Incubation Pipeline (Only if ventures exist) */}
      <VenturesSection ventures={content.ventures} />

      {/* 5. Client Testimonials (Rendered ONLY if toggle ON and has items) */}
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

      {/* 9. Minimalist Philosophy Climax Statement */}
      <PhilosophySection />

      {/* 10. Direct In-Page Contact & Inquiry Form */}
      <CtaSection onOpenContact={openContactModal} />
    </main>
  );
};
