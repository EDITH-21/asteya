import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  initializeDatabase,
  getActiveAnnouncement,
  getPublishedAnnouncements,
  getPublishedTestimonials,
  getPublishedFAQs,
  getPublishedVentures,
  getAboutContent,
  getPublishedTeamMembers,
  getSiteSettings,
} from "./db";
import type { PublicSiteContent } from "./content-types";

/**
 * Raw database query to assemble all public site content.
 */
async function fetchPublicSiteContentRaw(): Promise<PublicSiteContent> {
  await initializeDatabase();

  const [activeAnnouncement, publishedAnnouncements, testimonials, faqs, ventures, about, team, settings] =
    await Promise.all([
      getActiveAnnouncement(),
      getPublishedAnnouncements(),
      getPublishedTestimonials(),
      getPublishedFAQs(),
      getPublishedVentures(),
      getAboutContent(),
      getPublishedTeamMembers(),
      getSiteSettings(),
    ]);

  return {
    activeAnnouncement: activeAnnouncement || (publishedAnnouncements.length > 0 ? publishedAnnouncements[0] : null),
    announcements: publishedAnnouncements,
    testimonials,
    faqs,
    ventures,
    about,
    team,
    settings,
  };
}

/**
 * Fetch all public-facing site content on the server with cache tags and ISR.
 * Revalidated via revalidateTag("site-content") or revalidatePath.
 */
export const getPublicSiteContent = cache(
  unstable_cache(
    fetchPublicSiteContentRaw,
    ["public-site-content-cache"],
    {
      revalidate: 60,
      tags: [
        "site-content",
        "ventures",
        "testimonials",
        "announcements",
        "faqs",
        "about",
        "team",
        "settings",
      ],
    }
  )
);
