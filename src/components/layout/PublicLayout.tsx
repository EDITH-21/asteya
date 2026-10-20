"use client";

import React, { useState, createContext, useContext } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { AnnouncementBanner } from "@/components/ui/AnnouncementBanner";
import { MaintenanceOverlay } from "@/components/ui/MaintenanceOverlay";
import type { PublicSiteContent } from "@/lib/server/content-types";

const ContactModal = dynamic(
  () => import("@/components/ui/ContactModal").then((mod) => mod.ContactModal),
  { ssr: false }
);

interface ContactModalContextType {
  openContactModal: () => void;
  closeContactModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextType>({
  openContactModal: () => {},
  closeContactModal: () => {},
});

export const useContactModal = () => useContext(ContactModalContext);

interface PublicLayoutProps {
  content: PublicSiteContent;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ content, children }) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [announcementHeight, setAnnouncementHeight] = useState(0);

  const handleOpenContact = () => setContactModalOpen(true);
  const handleCloseContact = () => setContactModalOpen(false);

  // If maintenance mode is enabled by admin in settings, render the maintenance shield for public visitors
  if (content.settings.maintenanceMode) {
    return <MaintenanceOverlay contactEmail={content.settings.contactEmail} />;
  }

  const hasFaqs = Boolean(content.faqs && content.faqs.length > 0);

  return (
    <ContactModalContext.Provider
      value={{ openContactModal: handleOpenContact, closeContactModal: handleCloseContact }}
    >
      <div className="relative min-h-[100svh] bg-[#05070b] text-[#f1f5f9] flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
        {/* Background Subtle Atmosphere */}
        <div className="fixed inset-0 bg-grid-subtle pointer-events-none z-0 opacity-30" />

        {/* Global Active Announcement */}
        <AnnouncementBanner
          announcement={content.activeAnnouncement}
          onHeightChange={setAnnouncementHeight}
        />

        {/* Shared Navbar across ALL public pages */}
        <Navbar
          onOpenContact={handleOpenContact}
          hasFaqs={hasFaqs}
          topOffset={announcementHeight}
        />

        {/* Main Content Area */}
        <div
          className="flex-1 flex flex-col transition-all duration-300"
          style={{ paddingTop: announcementHeight > 0 ? `${announcementHeight}px` : undefined }}
        >
          {children}
        </div>

        {/* Shared Footer across ALL public pages */}
        <Footer
          onOpenContact={handleOpenContact}
          settings={content.settings}
          hasFaqs={hasFaqs}
        />

        {/* Interactive Contact & Inquiry Modal */}
        {contactModalOpen && (
          <ContactModal isOpen={contactModalOpen} onClose={handleCloseContact} />
        )}
      </div>
    </ContactModalContext.Provider>
  );
};
