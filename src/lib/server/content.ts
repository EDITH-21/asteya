import "server-only";
import { cache } from "react";
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
 * Wrapped in React cache() to deduplicate queries across a single render tree.
 */
export const getPublicSiteContent = cache(async (): Promise<PublicSiteContent> => {
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
});
