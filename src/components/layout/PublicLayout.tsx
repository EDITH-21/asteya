"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
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

const PublicContentContext = createContext<PublicSiteContent | null>(null);
export const usePublicContent = () => useContext(PublicContentContext);

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

export const PublicLayout: React.FC<PublicLayoutProps> = ({ content: initialContent, children }) => {
  const [liveContent, setLiveContent] = useState<PublicSiteContent | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [announcementHeight, setAnnouncementHeight] = useState(0);

  const content = liveContent || initialContent;

  useEffect(() => {
    const sync = async () => {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setLiveContent((prev) => ({
              ...json.content,
              team: prev?.team || initialContent.team || [],
            }));
          }
        }
      } catch {
        // ignore network error
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };

    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [initialContent.team]);

  const handleOpenContact = () => setContactModalOpen(true);
  const handleCloseContact = () => setContactModalOpen(false);

  // If maintenance mode is enabled by admin in settings, render the maintenance shield for public visitors
  if (content.settings.maintenanceMode) {
    return <MaintenanceOverlay contactEmail={content.settings.contactEmail} />;
  }

  const hasFaqs = Boolean(content.faqs && content.faqs.length > 0);
  const hasVentures = Boolean(content.ventures && content.ventures.length > 0);

  return (
    <PublicContentContext.Provider value={content}>
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
            hasVentures={hasVentures}
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
            hasVentures={hasVentures}
          />

          {/* Interactive Contact & Inquiry Modal */}
          {contactModalOpen && (
            <ContactModal isOpen={contactModalOpen} onClose={handleCloseContact} />
          )}
        </div>
      </ContactModalContext.Provider>
    </PublicContentContext.Provider>
  );
};
