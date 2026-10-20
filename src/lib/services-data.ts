export interface DetailedService {
  slug: string;
  number: string;
  title: string;
  h1: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  overview: string[];
  benefits: { title: string; description: string }[];
  deliverables: { title: string; description: string }[];
  technicalStack: string[];
  useCases: string[];
}

export const DETAILED_SERVICES: Record<string, DetailedService> = {
  "web-development": {
    slug: "web-development",
    number: "01",
    title: "Web Development",
    h1: "High-Performance Web Development & Platform Architecture",
    tagline: "Modern, responsive, and scalable web platforms engineered for longevity.",
    metaTitle: "Web Development Services | Aadrut",
    metaDescription: "Aadrut builds high-performance Next.js websites, web apps, and low-latency API architectures with edge infrastructure and resilient design.",
    overview: [
      "We build modern, type-safe web applications designed to load instantly, convert visitors, and scale reliably as traffic expands. Our engineering approach balances visual polish with deep technical rigor.",
      "By leveraging contemporary frameworks like Next.js, React, and TypeScript alongside edge networks, we deliver fluid user experiences with minimal latency and maximal responsiveness.",
    ],
    benefits: [
      {
        title: "Sub-Second Load Times",
        description: "Optimized server-side rendering, asset compression, and edge caching for peak Core Web Vitals.",
      },
      {
        title: "Scalable Infrastructure",
        description: "Stateless architecture and serverless microservices capable of handling traffic spikes without degrading.",
      },
      {
        title: "Accessibility & Cross-Device Parity",
        description: "Strict WCAG standards and responsive design ensuring seamless operation on smartphones, tablets, and desktops.",
      },
    ],
    deliverables: [
      {
        title: "Full-Stack Web Applications",
        description: "Interactive SaaS platforms, client portals, and customer-facing dashboards built with React and Next.js.",
      },
      {
        title: "Marketing & Corporate Websites",
        description: "High-converting corporate web presences featuring bespoke design, clear typography, and clean animations.",
      },
      {
        title: "API & Microservice Development",
        description: "Robust REST and GraphQL APIs featuring rigorous schema validation, auth guards, and rate limiting.",
      },
      {
        title: "Performance & Security Audits",
        description: "In-depth code reviews, bundle size reductions, and security hardening against OWASP top vulnerabilities.",
      },
    ],
    technicalStack: ["Next.js (App Router)", "TypeScript", "React", "Node.js", "Tailwind CSS", "Vercel / Cloudflare Edge", "PostgreSQL / SQLite"],
    useCases: ["SaaS Product Frontends", "Corporate Portals", "High-Traffic Content Platforms", "E-commerce & Transactional Hubs"],
  },

  "digital-solutions": {
    slug: "digital-solutions",
    number: "02",
    title: "Digital Solutions",
    h1: "Tailored Digital Solutions & Enterprise Systems",
    tagline: "Targeted engineering resolving complex operational bottlenecks.",
    metaTitle: "Digital Solutions & Software Engineering | Aadrut",
    metaDescription: "Transform operational challenges into intuitive software systems with Aadrut's custom digital solutions and software engineering services.",
    overview: [
      "Every organization faces friction points where generic off-the-shelf software falls short. Aadrut architects custom digital solutions built specifically around your workflows, data structures, and operational objectives.",
      "From unifying fragmented back-office systems to creating real-time operations dashboards, we engineer tools that give leadership total clarity and empower teams to do their best work.",
    ],
    benefits: [
      {
        title: "Tailored to Exact Workflows",
        description: "Zero bloat, zero unnecessary licensing costs—software shaped precisely around your team's day-to-day operations.",
      },
      {
        title: "Unified Data Ecosystem",
        description: "Break down data silos by connecting third-party platforms, ERPs, and legacy databases into unified interfaces.",
      },
      {
        title: "Measurable Efficiency Gains",
        description: "Eliminate manual data re-entry, reduce operational error rates, and accelerate customer turnaround times.",
      },
    ],
    deliverables: [
      {
        title: "Custom Enterprise Portals",
        description: "Secure, role-based dashboards for staff, partners, and vendors to manage critical operations.",
      },
      {
        title: "Systems Integration & Middleware",
        description: "Custom connectors and sync engines linking billing, CRM, ERP, and operational tools seamlessly.",
      },
      {
        title: "Real-Time Telemetry & Reporting",
        description: "Intuitive visual intelligence dashboards displaying key performance indicators as events happen.",
      },
      {
        title: "Database Architecture & Optimization",
        description: "Normalized relational and document schemas structured for high throughput, data integrity, and fast queries.",
      },
    ],
    technicalStack: ["Node.js", "TypeScript", "REST / Webhooks", "Docker", "PostgreSQL", "Next.js", "Redis"],
    useCases: ["Internal Workflow Systems", "Partner Portals", "Automated Billing & Reporting", "Real-Time Operations Trackers"],
  },

  "brand-design": {
    slug: "brand-design",
    number: "03",
    title: "Brand & Design",
    h1: "Visual Precision, Brand Identity & Interface Systems",
    tagline: "Enduring digital identities and design systems engineered for clarity.",
    metaTitle: "Brand & UI/UX Design Systems | Aadrut",
    metaDescription: "Elevate your digital presence with Aadrut's modern brand identities, design systems, UI/UX architecture, and interactive product design.",
    overview: [
      "Brand identity is more than a logo—it is the unified aesthetic, tone, and tactile feel of every digital touchpoint. Aadrut creates modern, minimalist visual systems that build immediate trust.",
      "We bridge the gap between design and engineering, crafting cohesive design systems and component libraries that maintain visual consistency while accelerating frontend feature delivery.",
    ],
    benefits: [
      {
        title: "Distinctive Visual Authority",
        description: "Move away from generic templates with a bespoke aesthetic that commands respect in your industry.",
      },
      {
        title: "Engineering-Ready Components",
        description: "Design tokens and interactive Figma components mapped 1:1 to production code for rapid engineering handoff.",
      },
      {
        title: "Human-Centered Usability",
        description: "Intuitive user flows, clear visual hierarchy, and accessible typography that make complex software simple.",
      },
    ],
    deliverables: [
      {
        title: "Comprehensive Brand Guidelines",
        description: "Typography rules, color schemes, logo usage, iconography, and art direction documented in an interactive handbook.",
      },
      {
        title: "Scalable UI Design Systems",
        description: "Figma component suites featuring atomic design tokens, dark/light variants, and responsive layouts.",
      },
      {
        title: "Interactive Prototyping",
        description: "High-fidelity clickable prototypes that validate user flows, interactions, and animations before writing code.",
      },
      {
        title: "Design Engineering & Audits",
        description: "Translating mockups into pixel-perfect Tailwind/CSS components with accessibility and contrast compliance.",
      },
    ],
    technicalStack: ["Figma", "Tailwind CSS", "Design Tokens", "Framer Motion", "SVG Vector Systems", "WCAG AA Contrast Standards"],
    useCases: ["Product Rebranding", "Design System Creation", "SaaS Interface Redesign", "High-Converting Landing Pages"],
  },

  "business-automation": {
    slug: "business-automation",
    number: "04",
    title: "Business Automation",
    h1: "Autonomous Business Automation & Workflow Engineering",
    tagline: "Automate repetitive tasks, connect tools, and multiply team productivity.",
    metaTitle: "Business Automation & Workflow Engineering | Aadrut",
    metaDescription: "Streamline operations with Aadrut's business automation services. Connect CRMs, automate repetitive tasks, and deploy smart workflows.",
    overview: [
      "High-performing teams should focus on strategic growth, not copying data between spreadsheets. Aadrut engineers autonomous workflows that bridge software gaps, automate notifications, and keep data synchronized.",
      "From lead qualification and contract generation to multi-step invoice processing and customer onboarding, we build reliable automated pipelines that run silently in the background 24/7.",
    ],
    benefits: [
      {
        title: "Hours Saved Every Week",
        description: "Eliminate manual data entry and repetitive admin work so your team can focus on high-value client work.",
      },
      {
        title: "Error-Free Execution",
        description: "Deterministic validation, error handling, and automated retry mechanisms guarantee data integrity.",
      },
      {
        title: "Continuous 24/7 Operations",
        description: "Automated pipelines trigger instantly upon customer actions, ensuring immediate follow-up and faster fulfillment.",
      },
    ],
    deliverables: [
      {
        title: "Cross-Platform Workflow Pipelines",
        description: "Event-driven pipelines connecting forms, CRMs, payment gateways, and databases using webhooks and APIs.",
      },
      {
        title: "Customer Onboarding Sequences",
        description: "Automated account provisioning, welcome emails, contract generation, and initial data verification.",
      },
      {
        title: "Financial & Invoicing Workflows",
        description: "Automated invoice generation, payment reminders, expense tracking, and accounting reconciliation.",
      },
      {
        title: "Custom Automation Bots & Scripts",
        description: "Dedicated serverless functions and worker scripts handling custom business logic and scheduled tasks.",
      },
    ],
    technicalStack: ["Node.js / Python", "Webhook Handlers", "Cron Schedulers", "Stripe / Payment APIs", "CRM Connectors", "Event Queues"],
    useCases: ["Lead Capture & Routing", "Invoice Generation", "Automated Onboarding", "Inventory & Order Syncing"],
  },

  "digital-presence": {
    slug: "digital-presence",
    number: "05",
    title: "Digital Presence",
    h1: "Modern Digital Presence & Interactive Customer Touchpoints",
    tagline: "Engaging digital tools and interactive touchpoints that turn visitors into customers.",
    metaTitle: "Digital Presence & Interactive Experiences | Aadrut",
    metaDescription: "Build modern digital touchpoints with Aadrut: interactive profiles, dynamic QR experiences, mobile-first portals, and fast landing pages.",
    overview: [
      "In a crowded digital landscape, your first impression determines customer trust. Aadrut develops modern digital presence solutions that capture attention, convey credibility, and drive conversions.",
      "From mobile-first smart profiles and dynamic QR menu systems to high-speed campaign landing pages, we build experiences that load in milliseconds and delight users across all screen sizes.",
    ],
    benefits: [
      {
        title: "Instant Engagement",
        description: "Zero bloat and ultra-fast loading ensure visitors interact immediately without waiting or bouncing.",
      },
      {
        title: "Mobile-First Usability",
        description: "Engineered specifically for touchscreens with large tap targets, smooth gestures, and clear readability.",
      },
      {
        title: "Dynamic Content Updates",
        description: "Easily adjust offerings, links, and announcements in real time without republishing the entire site.",
      },
    ],
    deliverables: [
      {
        title: "Smart Digital Profiles",
        description: "Next-generation digital business cards and executive profiles with one-tap contact sharing and social links.",
      },
      {
        title: "Dynamic QR Code Experiences",
        description: "Contextual QR landing pages for restaurants, events, retail showrooms, and product packaging.",
      },
      {
        title: "Campaign Landing Hubs",
        description: "Focused single-purpose landing pages optimized for marketing campaigns, product launches, and lead capture.",
      },
      {
        title: "Interactive Lead Generation Forms",
        description: "Multi-step interactive calculators, assessment forms, and booking tools that qualify prospects.",
      },
    ],
    technicalStack: ["Next.js", "Responsive CSS", "Dynamic QR Routers", "Micro-Interactions", "Mobile Optimization", "Analytics & Conversion Tracking"],
    useCases: ["Executive Profiles", "Hospitality QR Menus", "Product Launch Landers", "Event Information Portals"],
  },

  "technology-consulting": {
    slug: "technology-consulting",
    number: "06",
    title: "Technology Consulting",
    h1: "Strategic Technology Consulting & Architecture Advisory",
    tagline: "Clear engineering roadmaps, architecture auditing, and modernization strategies.",
    metaTitle: "Technology Consulting & Architecture Strategy | Aadrut",
    metaDescription: "Navigate complex technical decisions with Aadrut's technology consulting: tech stack modernization, security audits, and cloud roadmaps.",
    overview: [
      "Choosing the right technology stack and architectural foundation can make or break a company's ability to scale. Aadrut provides pragmatic, battle-hardened technical guidance to business founders and executives.",
      "We evaluate your current codebase, infrastructure, and team capabilities to design actionable roadmaps that cut technical debt, improve security, and accelerate time-to-market.",
    ],
    benefits: [
      {
        title: "De-Risk Critical Decisions",
        description: "Avoid costly architectural rewrites by making proven, informed technology choices from the start.",
      },
      {
        title: "Lower Total Cost of Ownership",
        description: "Streamline cloud infrastructure, eliminate redundant tools, and optimize compute resources.",
      },
      {
        title: "Accelerated Delivery Velocity",
        description: "Empower engineering teams with modern CI/CD pipelines, type safety, and clean software architecture.",
      },
    ],
    deliverables: [
      {
        title: "Architecture & Code Audits",
        description: "Comprehensive evaluations of code quality, performance bottlenecks, security postures, and scalability limits.",
      },
      {
        title: "Tech Stack Modernization Roadmaps",
        description: "Pragmatic step-by-step migration plans from legacy stacks to modern TypeScript, Next.js, and cloud backends.",
      },
      {
        title: "Security & Reliability Reviews",
        description: "Auditing authentication, authorization, data encryption, API security, and disaster recovery readiness.",
      },
      {
        title: "Fractional Engineering Leadership",
        description: "Strategic guidance on sprint planning, vendor selection, team hiring criteria, and technical leadership.",
      },
    ],
    technicalStack: ["Cloud Architecture", "Next.js / Node Ecosystem", "Security Auditing", "Database Optimization", "CI/CD & DevOps", "Performance Profiling"],
    useCases: ["Pre-Seed / Series A Technical Diligence", "Legacy Migration Planning", "Security Hardening", "Infrastructure Optimization"],
  },
};
