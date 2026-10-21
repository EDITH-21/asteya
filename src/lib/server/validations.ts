import "server-only";
import { z } from "zod";

// Helper: Disallow raw HTML tags in admin text inputs
const NO_HTML_REGEX = /<[a-z/][\s\S]*>/i;
const noHtmlMessage = "HTML tags are not allowed. Use plain text or limited markdown.";

// Helper: Verify URLs start with https:// or relative site path
const isSafeUrl = (val: string | undefined | null) => {
  if (!val || val.trim().length === 0) return true;
  const clean = val.trim();
  return clean.startsWith("https://") || clean.startsWith("/");
};

// Helper: Verify URL is https:// only
const isHttpsOnly = (val: string | undefined | null) => {
  if (!val || val.trim().length === 0) return true;
  return val.trim().startsWith("https://");
};

// Helper: Allowlisted photo URL or /public path
const isSafePhotoPath = (val: string | undefined | null) => {
  if (!val || val.trim().length === 0) return true;
  const clean = val.trim();
  if (clean.startsWith("/")) return true;
  try {
    const url = new URL(clean);
    const allowlisted = [
      "images.unsplash.com",
      "avatar.vercel.sh",
      "avatars.githubusercontent.com",
    ];
    return url.protocol === "https:" && allowlisted.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};

// Helper: Forbidden C-Suite titles
const FORBIDDEN_TITLES_REGEX = /\b(ceo|cto|coo|chief\s+executive|chief\s+technology|chief\s+operating)\b/i;

export const ALLOWED_ENQUIRY_SERVICES = [
  "Web Development",
  "Digital Solutions",
  "Brand & Design",
  "Business Automation",
  "Digital Presence",
  "Technology Consulting",
  "General Inquiry",
  "Other",
] as const;

export const EnquiryCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[^\r\n]+$/, "Name cannot contain newline characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(150, "Email cannot exceed 150 characters")
    .regex(/^[^\r\n]+$/, "Email cannot contain newline characters"),
  type: z
    .string()
    .trim()
    .min(2, "Service type is required")
    .max(100, "Service type cannot exceed 100 characters")
    .regex(/^[^\r\n]+$/, "Service type cannot contain newline characters")
    .refine(
      (val) =>
        ALLOWED_ENQUIRY_SERVICES.includes(val as (typeof ALLOWED_ENQUIRY_SERVICES)[number]) ||
        /^[A-Za-z0-9 &+,/-]{2,100}$/.test(val),
      { message: "Please select an authorized service capability." }
    ),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(3000, "Message cannot exceed 3000 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  _hp: z.string().max(0, "Automated submission rejected").optional().or(z.literal("")),
});

export const AdminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(12, "New password must be at least 12 characters long")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const VerifyMfaSchema = z.object({
  mfaToken: z.string().min(1, "Pre-auth token is required"),
  code: z.string().min(6, "Code must be 6 digits or recovery code format").max(20),
});

export const EnquiryUpdateSchema = z.object({
  status: z.enum(["new", "in_progress", "done", "contacted", "archived"]).optional(),
  notes: z
    .string()
    .max(3000, "Notes cannot exceed 3000 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    .optional(),
});

export const ServiceUpdateSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(100)
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    .optional(),
  tagline: z
    .string()
    .min(2)
    .max(150)
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    .optional(),
  description: z
    .string()
    .min(10)
    .max(500)
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    .optional(),
  capabilities: z.array(z.string().min(1).max(100)).optional(),
  active: z.boolean().optional(),
});

// ==========================================
// 1. Announcements Validation Schema
// ==========================================
export const AnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(500, "Message cannot exceed 500 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  type: z.enum(["info", "success", "warning"]),
  buttonLabel: z
    .string()
    .trim()
    .max(50, "Button label cannot exceed 50 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    .optional()
    .or(z.literal("")),
  buttonLink: z
    .string()
    .trim()
    .max(200, "Link too long")
    .refine(isSafeUrl, "Links must start with https:// or a site-relative path /")
    .optional()
    .or(z.literal("")),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  active: z.boolean().default(false),
  dismissible: z.boolean().default(true),
  displayStyle: z.enum(["top_bar", "popup"]).default("top_bar"),
});

// ==========================================
// 2. Testimonials Validation Schema
// ==========================================
export const TestimonialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  roleOrCompany: z
    .string()
    .trim()
    .min(2, "Role or company must be at least 2 characters")
    .max(100, "Role or company cannot exceed 100 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  quote: z
    .string()
    .trim()
    .min(10, "Quote must be at least 10 characters")
    .max(1000, "Quote cannot exceed 1000 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  order: z.number().int().default(0),
  published: z.boolean().default(false),
  rating: z.number().int().min(1).max(5).optional(),
});

// ==========================================
// 3. FAQ Validation Schema
// ==========================================
export const FAQSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "Question must be at least 5 characters")
    .max(200, "Question cannot exceed 200 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  answer: z
    .string()
    .trim()
    .min(10, "Answer must be at least 10 characters")
    .max(2000, "Answer cannot exceed 2000 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  category: z
    .string()
    .trim()
    .min(2, "Category is required")
    .max(50, "Category cannot exceed 50 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  order: z.number().int().default(0),
  published: z.boolean().default(false),
});

// ==========================================
// 4. Ventures Validation Schema
// ==========================================
export const VentureStatSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  value: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
});

export const VentureSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Venture name must be at least 2 characters")
    .max(60, "Venture name cannot exceed 60 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  tagline: z
    .string()
    .trim()
    .min(2, "Tagline must be at least 2 characters")
    .max(120, "Tagline cannot exceed 120 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  status: z.enum(["Live", "In development", "Coming soon"]),
  label: z
    .string()
    .trim()
    .max(60, "Label cannot exceed 60 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    .optional()
    .or(z.literal("")),
  link: z
    .string()
    .trim()
    .max(200)
    .refine(isHttpsOnly, "Venture link must use https:// protocol")
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(40)
        .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    )
    .max(10, "Maximum 10 tags allowed")
    .default([]),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
  stats: z.array(VentureStatSchema).max(6).optional().default([]),
});

// ==========================================
// 5. About Content & Team Validation Schemas
// ==========================================
export const AboutValueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  text: z
    .string()
    .trim()
    .min(5)
    .max(300)
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
});

export const AboutContentSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(5, "Headline must be at least 5 characters")
    .max(150, "Headline cannot exceed 150 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  story: z
    .string()
    .trim()
    .min(20, "Story must be at least 20 characters")
    .max(2000, "Story cannot exceed 2000 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  mission: z
    .string()
    .trim()
    .min(10, "Mission must be at least 10 characters")
    .max(1000, "Mission cannot exceed 1000 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  vision: z
    .string()
    .trim()
    .min(10, "Vision must be at least 10 characters")
    .max(1000, "Vision cannot exceed 1000 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  values: z
    .array(AboutValueSchema)
    .min(1, "At least one core value is required")
    .max(8, "Maximum 8 values allowed"),
});

export const TeamMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  displayRole: z
    .string()
    .trim()
    .min(2, "Role must be at least 2 characters")
    .max(80, "Role cannot exceed 80 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    .refine(
      (val) => !FORBIDDEN_TITLES_REGEX.test(val),
      "Executive C-suite titles (CEO, CTO, COO) are not permitted."
    ),
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage)
    .optional()
    .or(z.literal("")),
  photoUrl: z
    .string()
    .trim()
    .max(300)
    .refine(isSafePhotoPath, "Photo path must be a /public path or allowlisted secure host")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .trim()
    .max(200)
    .refine(isHttpsOnly, "LinkedIn URL must use https://")
    .optional()
    .or(z.literal("")),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

// ==========================================
// 6. Site Settings Validation Schema
// ==========================================
export const SiteSettingsSchema = z.object({
  contactEmail: z.string().trim().email("Please provide a valid contact email"),
  instagramUrl: z
    .string()
    .trim()
    .max(200)
    .refine(isHttpsOnly, "Instagram URL must use https://"),
  linkedinUrl: z
    .string()
    .trim()
    .max(200)
    .refine(isHttpsOnly, "LinkedIn URL must use https://"),
  footerTagline: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .refine((val) => !NO_HTML_REGEX.test(val), noHtmlMessage),
  maintenanceMode: z.boolean().default(false),
  showTestimonials: z.boolean().default(false),
});

// Reorder items schema
export const ReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Ordered IDs array is required"),
});
