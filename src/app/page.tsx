import React from "react";
import { getPublicSiteContent } from "@/lib/server/content";
import { AnnouncementBanner } from "@/components/ui/AnnouncementBanner";
import { MaintenanceOverlay } from "@/components/ui/MaintenanceOverlay";
import { HomePageClient } from "@/components/pages/HomePageClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getPublicSiteContent();

  return (
    <>
      {content.settings.maintenanceMode && (
        <MaintenanceOverlay contactEmail={content.settings.contactEmail} />
      )}
      <AnnouncementBanner announcement={content.activeAnnouncement} />
      <HomePageClient content={content} />
    </>
  );
}
