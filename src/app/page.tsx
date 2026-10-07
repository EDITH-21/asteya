"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ApproachSection } from "@/components/sections/ApproachSection";
import { VenturesSection } from "@/components/sections/VenturesSection";
import { TechnologySection } from "@/components/sections/TechnologySection";
import { WhyAsteyaSection } from "@/components/sections/WhyAsteyaSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { PhilosophySection } from "@/components/sections/PhilosophySection";
import { CtaSection } from "@/components/sections/CtaSection";
import { Footer } from "@/components/sections/Footer";
import { ContactModal } from "@/components/ui/ContactModal";

export default function Home() {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleOpenContact = () => {
    setContactModalOpen(true);
  };

  const handleCloseContact = () => {
    setContactModalOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-[#05070b] text-[#f1f5f9] overflow-hidden">
      {/* Dynamic Background Noise / Grid Overlay */}
      <div className="fixed inset-0 bg-grid-subtle pointer-events-none z-0 opacity-40" />

      {/* Floating Navigation */}
      <Navbar onOpenContact={handleOpenContact} />

      {/* 1. Cinematic Full-Screen Hero */}
      <Hero onOpenContact={handleOpenContact} />

      {/* 2. Editorial About Section with Interactive Digital Mesh */}
      <AboutSection />

      {/* 3. Core Interactive Services Panels */}
      <ServicesSection onOpenContact={handleOpenContact} />

      {/* 4. Horizontal Storytelling Approach Journey */}
      <ApproachSection />

      {/* 5. Major Ventures: Spotlight on Attenza & Future Pipeline */}
      <VenturesSection />

      {/* 6. Built For The Future: Orbital Technology System */}
      <TechnologySection />

      {/* 7. Why Asteya: Purpose-Driven Architecture */}
      <WhyAsteyaSection />

      {/* 8. Concept to Reality: 7-Stage Illuminated Vertical Timeline */}
      <ProcessSection />

      {/* 9. Minimalist Philosophy Climax Statement */}
      <PhilosophySection />

      {/* 10. Closing Call to Action */}
      <CtaSection onOpenContact={handleOpenContact} />

      {/* 11. Minimal Footer */}
      <Footer onOpenContact={handleOpenContact} />

      {/* Interactive Contact & Inquiry Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={handleCloseContact}
      />
    </main>
  );
}
