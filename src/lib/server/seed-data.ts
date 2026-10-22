import "server-only";
import type { AdminUser } from "./db";
import type {
  Venture,
  AboutContent,
  TeamMember,
  FAQItem,
  SiteSettings,
} from "./content-types";

/**
 * Administrative Users Seed Configuration.
 * No hardcoded default credentials or seed users.
 * Administrator accounts are created exclusively when explicit ADMIN_EMAIL and
 * ADMIN_INITIAL_PASSWORD environment variables are supplied.
 */
export const SEED_ADMIN_USERS: AdminUser[] = [];

/**
 * Seed Ventures (migrated from VenturesSection).
 */
export const SEED_VENTURES: Venture[] = [
  {
    id: "venture-attenza-01",
    name: "Attenza",
    tagline: "Focus better. Learn smarter.",
    description:
      "Attenza is a productivity-focused learning experience designed to help people create a more focused digital environment.",
    status: "Coming soon",
    label: "Aadrut Venture Labs",
    link: "https://attenza.aadrut.tech",
    tags: [
      "Cognitive Friction Reduction",
      "Flow State Architecture",
      "Attention Analytics",
    ],
    featured: true,
    order: 1,
    published: true,
    stats: [],
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
];

/**
 * Seed About Content (grounded in existing AboutSection, neutral text, no invented claims).
 */
export const SEED_ABOUT_CONTENT: AboutContent = {
  headline: "Technology should move humanity forward.",
  story:
    "Aadrut exists to transform ideas into meaningful digital experiences, products, and technology ventures. We combine engineering, design, automation, and emerging technologies to build solutions that are useful today and ready for tomorrow.",
  mission:
    "To architect and engineer reliable digital products, intelligent systems, and scalable software platforms that deliver measurable, lasting utility.",
  vision:
    "A future where thoughtful engineering, seamless automation, and intuitive design empower enterprises and creators to operate with clarity and speed.",
  values: [
    {
      title: "Precision Engineering",
      text: "High-speed, scalable, modern architectural foundations built for longevity and maintainability.",
    },
    {
      title: "Intelligent Velocity",
      text: "Autonomous workflows and rapid continuous product deployment loops without compromising stability.",
    },
    {
      title: "Transparent Ownership",
      text: "Complete source code transfer, clean documentation, and honest technical collaboration at every phase.",
    },
  ],
  updatedAt: "2026-10-20T18:00:00.000Z",
};

/**
 * Seed Team Members (strictly Founder / Co-Founder, no CEO/CTO/COO, empty bio/photo).
 */
export const SEED_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "team-shivam-tiwari",
    name: "Shivam Tiwari",
    displayRole: "Founder",
    bio: "Sets the vision and direction for Aadrut, guiding the company's strategy, products and ventures. Focused on turning ideas into dependable digital solutions that create real value for clients.",
    photoUrl: "",
    linkedinUrl: "",
    order: 1,
    published: true,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "team-durva-bhatt",
    name: "Durva Bhatt",
    displayRole: "Co-Founder",
    bio: "Leads Aadrut's technology and engineering, shaping how products are designed, built and scaled. Focused on clean, secure and reliable systems that hold up in the real world.",
    photoUrl: "",
    linkedinUrl: "",
    order: 2,
    published: true,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "team-kajal-pal",
    name: "Kajal Pal",
    displayRole: "Co-Founder",
    bio: "Oversees day-to-day operations and project delivery, keeping teams, timelines and clients aligned. Focused on smooth execution and a consistent experience from the first conversation to launch.",
    photoUrl: "",
    linkedinUrl: "",
    order: 3,
    published: true,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
];

/**
 * Seed 9 generic FAQs for tech services company.
 * ALL seeded as unpublished drafts (published: false) for admin review.
 * No prices, timelines, or guarantees.
 */
export const SEED_FAQS: FAQItem[] = [
  {
    id: "faq-01",
    question: "What core services and capabilities does Aadrut offer?",
    answer:
      "Aadrut provides full-cycle digital development: high-performance web applications, bespoke business automation, cloud infrastructure, brand identity systems, and custom software engineering.",
    category: "Services",
    order: 1,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "faq-02",
    question: "How does the project onboarding and discovery process work?",
    answer:
      "We begin with a technical discovery phase to evaluate your requirements, existing stack, and operational objectives. From there, we outline architecture options, milestones, and deliverable specifications.",
    category: "Process",
    order: 2,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "faq-03",
    question: "How are project enquiries and client communications managed?",
    answer:
      "Enquiries submitted through our website are reviewed directly by technical leads. We follow up to schedule a structured consultation, establish direct communication channels, and maintain transparent progress tracking.",
    category: "Communication",
    order: 3,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "faq-04",
    question: "Who owns the intellectual property and code upon delivery?",
    answer:
      "You retain full ownership of all custom source code, documentation, digital assets, and deliverables upon completion and handover. We do not retain proprietary lock-in on custom-built client code.",
    category: "Ownership",
    order: 4,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "faq-05",
    question: "What support and maintenance is provided post-launch?",
    answer:
      "We provide post-deployment monitoring, stabilization support, and optional ongoing technical retainers covering performance optimizations, security patches, and incremental feature development.",
    category: "Support",
    order: 5,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "faq-06",
    question: "Can Aadrut augment or collaborate with our existing engineering team?",
    answer:
      "Yes. We collaborate flexibly—either as an autonomous cross-functional unit executing dedicated initiatives, or embedded alongside your internal engineers to accelerate key development tracks.",
    category: "Engagement",
    order: 6,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "faq-07",
    question: "What primary technology stacks and architectures do you use?",
    answer:
      "Our core engineering stack leverages TypeScript, modern React and Next.js, Node.js, distributed database systems, cloud serverless runtimes, and secure REST/GraphQL API architectures.",
    category: "Technology",
    order: 7,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "faq-08",
    question: "How do you protect client data and intellectual property confidentiality?",
    answer:
      "We execute standard non-disclosure agreements (NDAs) prior to detailed discovery, enforce least-privilege credential access, and adhere to secure development best practices throughout the relationship.",
    category: "Security",
    order: 8,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
  {
    id: "faq-09",
    question: "How do we get started with a new technical requirement?",
    answer:
      "You can reach out through our contact form with a brief summary of your project goals. Our team will coordinate an initial discovery session to explore technical scope and next steps.",
    category: "Process",
    order: 9,
    published: false,
    createdAt: "2026-10-20T18:00:00.000Z",
    updatedAt: "2026-10-20T18:00:00.000Z",
  },
];

/**
 * Seed Site Settings.
 * Testimonials display defaults to false as required.
 */
export const SEED_SITE_SETTINGS: SiteSettings = {
  contactEmail: "hello@aadrut.com",
  instagramUrl: "",
  linkedinUrl: "",
  footerTagline: "Digital Products, Intelligent Solutions & Future Ventures.",
  maintenanceMode: false,
  showTestimonials: true,
  updatedAt: "2026-10-20T18:00:00.000Z",
};
