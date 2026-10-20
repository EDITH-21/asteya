export type AnnouncementType = "info" | "success" | "warning";
export type AnnouncementDisplayStyle = "top_bar" | "popup";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  buttonLabel?: string;
  buttonLink?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  dismissible: boolean;
  displayStyle: AnnouncementDisplayStyle;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  roleOrCompany: string;
  quote: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VentureStatus = "Live" | "In development" | "Coming soon";

export interface VentureStat {
  label: string;
  value: string;
}

export interface Venture {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: VentureStatus;
  link?: string;
  tags: string[];
  featured: boolean;
  order: number;
  published: boolean;
  stats?: VentureStat[];
  createdAt: string;
  updatedAt: string;
}

export interface AboutValue {
  title: string;
  text: string;
}

export interface AboutContent {
  headline: string;
  story: string;
  mission: string;
  vision: string;
  values: AboutValue[];
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  displayRole: string;
  bio?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  contactEmail: string;
  instagramUrl: string;
  linkedinUrl: string;
  footerTagline: string;
  maintenanceMode: boolean;
  showTestimonials: boolean;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface PublicSiteContent {
  activeAnnouncement: Announcement | null;
  testimonials: Testimonial[];
  faqs: FAQItem[];
  ventures: Venture[];
  about: AboutContent;
  team: TeamMember[];
  settings: SiteSettings;
}
