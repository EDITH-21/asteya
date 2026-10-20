import React from "react";
import { getPublicSiteContent } from "@/lib/server/content";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { HomePageClient } from "@/components/pages/HomePageClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getPublicSiteContent();

  const homeContent = {
    ...content,
    team: [],
  };

  return (
    <PublicLayout content={homeContent}>
      <HomePageClient content={homeContent} />
    </PublicLayout>
  );
}
