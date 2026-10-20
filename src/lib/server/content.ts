import "server-only";
import {
  initializeDatabase,
  getActiveAnnouncement,
  getPublishedTestimonials,
  getPublishedFAQs,
  getPublishedVentures,
  getAboutContent,
  getPublishedTeamMembers,
  getSiteSettings,
} from "./db";
import type { PublicSiteContent } from "./content-types";

/**
 * Fetch all public-facing site content on the server.
 * Enables zero-flicker Server-Side Rendering (SSR) without layout shift.
 */
export async function getPublicSiteContent(): Promise<PublicSiteContent> {
  await initializeDatabase();

  const [activeAnnouncement, testimonials, faqs, ventures, about, team, settings] =
    await Promise.all([
      getActiveAnnouncement(),
      getPublishedTestimonials(),
      getPublishedFAQs(),
      getPublishedVentures(),
      getAboutContent(),
      getPublishedTeamMembers(),
      getSiteSettings(),
    ]);

  return {
    activeAnnouncement,
    testimonials,
    faqs,
    ventures,
    about,
    team,
    settings,
  };
}
