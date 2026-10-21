export const ADMIN_BASE_PATH = "/shikadu";

export interface NavItem {
  name: string;
  href: string;
}

/**
 * Centralized Contact and Social Channels
 * Replace LinkedIn URL via NEXT_PUBLIC_LINKEDIN_URL or directly here.
 */
export const CONTACT_CONFIG = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@asteya.tech",
  instagram: "https://www.instagram.com/asteya.tech/",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/company/asteya",
};

export const NAV_ITEMS: NavItem[] = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Ventures", href: "#ventures" },
  { name: "Process", href: "#process" },
  { name: "Technology", href: "#technology" },
  { name: "Why Aadrut", href: "#why-aadrut" },
];

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  gradient: string;
  iconName: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: "web-development",
    number: "01",
    title: "WEB DEVELOPMENT",
    tagline: "High-performance architecture",
    description: "Modern, responsive, scalable websites and web applications built with cutting-edge frameworks, robust infrastructure, and seamless user experiences.",
    capabilities: ["Full-Stack Next.js / React", "Low-Latency APIs", "Edge Infrastructure", "Scalable Cloud Architecture"],
    gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
    iconName: "Globe",
  },
  {
    id: "digital-solutions",
    number: "02",
    title: "DIGITAL SOLUTIONS",
    tagline: "Targeted problem solving",
    description: "Technology-driven solutions designed around real business problems, transforming complex operational hurdles into intuitive digital ecosystems.",
    capabilities: ["Custom Enterprise Software", "API Integrations", "Data Pipeline Systems", "Real-Time Operations Dashboards"],
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    iconName: "Cpu",
  },
  {
    id: "brand-design",
    number: "03",
    title: "BRAND & DESIGN",
    tagline: "Visual precision & identity",
    description: "Modern digital identities, interfaces, and visual systems engineered for clarity, emotion, and lasting brand resonance.",
    capabilities: ["Design Systems & UI Kits", "Interactive Prototyping", "Design Engineering", "Art Direction & Motion"],
    gradient: "from-fuchsia-500/20 via-pink-500/10 to-transparent",
    iconName: "Layers",
  },
  {
    id: "business-automation",
    number: "04",
    title: "BUSINESS AUTOMATION",
    tagline: "Autonomous workflows",
    description: "Smart workflows and technology that reduce repetitive work, streamline cross-platform data flow, and amplify human productivity.",
    capabilities: ["Intelligent Workflow Bots", "Automated CRM & Billing", "Data Transformation Tasks", "Webhook & Event Triggers"],
    gradient: "from-violet-500/20 via-indigo-500/10 to-transparent",
    iconName: "Zap",
  },
  {
    id: "digital-presence",
    number: "05",
    title: "DIGITAL PRESENCE",
    tagline: "Modern brand touchpoints",
    description: "Websites, digital profiles, forms, QR experiences, menus, and business-ready digital tools engineered to capture and engage audience interest instantly.",
    capabilities: ["Smart Interactive Profiles", "Dynamic QR Flow Systems", "Contextual Landing Experiences", "Omnichannel Portals"],
    gradient: "from-teal-500/20 via-emerald-500/10 to-transparent",
    iconName: "Sparkles",
  },
  {
    id: "technology-consulting",
    number: "06",
    title: "TECHNOLOGY CONSULTING",
    tagline: "Strategic roadmap & implementation",
    description: "Helping businesses identify, plan, and implement practical technology solutions with clear architecture roadmaps and measurable ROI.",
    capabilities: ["Tech Stack Modernization", "Architecture Auditing", "Cloud Migration Strategy", "Security & Reliability Reviews"],
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    iconName: "Compass",
  },
];

export interface WhyAadrutItem {
  number: string;
  title: string;
  description: string;
  badge: string;
}

export type WhyAsteyaItem = WhyAadrutItem;

export const WHY_AADRUT_ITEMS: WhyAadrutItem[] = [
  {
    number: "01",
    title: "PROBLEM FIRST",
    description: "We start with the problem, not the technology. Every line of code and design decision is tied to solving a genuine real-world friction point.",
    badge: "PURPOSE-DRIVEN",
  },
  {
    number: "02",
    title: "BUILT TO SCALE",
    description: "We design systems that can grow with their users and businesses without architectural bottlenecks or degrading performance.",
    badge: "MODULAR CORE",
  },
  {
    number: "03",
    title: "DESIGNED FOR PEOPLE",
    description: "Technology is only valuable when people can actually use it. We balance advanced engineering with intuitive, human-centered ergonomics.",
    badge: "HUMAN ERGONOMICS",
  },
  {
    number: "04",
    title: "FUTURE READY",
    description: "We continuously explore emerging technologies and new possibilities, ensuring your products are ready for the shifts of tomorrow.",
    badge: "NEXT-GEN READY",
  },
];

export const WHY_ASTEYA_ITEMS = WHY_AADRUT_ITEMS;

export type TechDomainTheme = "indigo" | "cyan" | "violet";

export interface TechDomain {
  id: string;
  label: string;
  desc: string;
  color: string;
  theme: TechDomainTheme;
}

export const TECH_DOMAINS: TechDomain[] = [
  { id: "ai", label: "AI", desc: "Machine intelligence & neural automation models", color: "#818cf8", theme: "indigo" },
  { id: "web", label: "WEB", desc: "Modern full-stack responsive web systems", color: "#22d3ee", theme: "cyan" },
  { id: "automation", label: "AUTOMATION", desc: "Autonomous workflows & business logic pipelines", color: "#a78bfa", theme: "violet" },
  { id: "cloud", label: "CLOUD", desc: "Serverless edge & scalable containerized infra", color: "#22d3ee", theme: "cyan" },
  { id: "digital-products", label: "DIGITAL PRODUCTS", desc: "End-to-end consumer & enterprise software", color: "#818cf8", theme: "indigo" },
  { id: "data", label: "DATA", desc: "Real-time analytics & intelligence streams", color: "#a78bfa", theme: "violet" },
  { id: "emerging-tech", label: "EMERGING TECHNOLOGY", desc: "Next-generation protocols and futuristic interfaces", color: "#818cf8", theme: "indigo" },
];
