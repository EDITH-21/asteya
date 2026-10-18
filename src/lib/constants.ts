export interface NavItem {
  name: string;
  href: string;
}

/**
 * Centralized Contact and Social Channels
 * Replace LinkedIn URL here when the company page is finalized.
 */
export const CONTACT_CONFIG = {
  email: "asteyatech2@gmail.com",
  instagram: "https://www.instagram.com/asteya.tech/?hl=en",
  // Temporary LinkedIn URL - easily updated from this single location:
  linkedin: "https://www.linkedin.com/",
};

export const NAV_ITEMS: NavItem[] = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Approach", href: "#approach" },
  { name: "Ventures", href: "#ventures" },
  { name: "Technology", href: "#technology" },
  { name: "Why Asteya", href: "#why-asteya" },
  { name: "Process", href: "#process" },
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
    capabilities: ["Full-Stack Next.js / React", "Ultra-low Latency APIs", "Edge Infrastructure", "Scalable Cloud Architecture"],
    gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
    iconName: "Globe",
  },
  {
    id: "digital-solutions",
    number: "02",
    title: "DIGITAL SOLUTIONS",
    tagline: "Targeted problem solving",
    description: "Technology-driven solutions designed around real business problems, transforming complex operational hurdles into intuitive digital ecosystems.",
    capabilities: ["Custom Enterprise Software", "API Integrations", "Data Pipeline Systems", "Real-time Operations Dashboards"],
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

export interface ApproachStage {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: { label: string; value: string }[];
}

export const APPROACH_STAGES: ApproachStage[] = [
  {
    number: "01",
    title: "IDEA",
    subtitle: "Understand the problem. Define the opportunity.",
    description: "We deconstruct domain complexity, analyze behavioral patterns, identify bottlenecks, and formulate razor-sharp technical and design hypotheses.",
    metrics: [
      { label: "Phase", value: "Discovery & Strategy" },
      { label: "Focus", value: "Problem Architecture" },
      { label: "Output", value: "Defined Blueprint" },
    ],
  },
  {
    number: "02",
    title: "BUILD",
    subtitle: "Design, engineer, test, and launch the solution.",
    description: "Using modern stacks and precision engineering, we turn blueprints into robust, scalable software with pixel-perfect interfaces and airtight code.",
    metrics: [
      { label: "Phase", value: "Engineering & QA" },
      { label: "Focus", value: "Precision Execution" },
      { label: "Output", value: "Live Production System" },
    ],
  },
  {
    number: "03",
    title: "EVOLVE",
    subtitle: "Improve continuously using data, technology, and feedback.",
    description: "Launch is day one. We monitor telemetry, analyze real-world usage patterns, iterate on feedback, and scale systems gracefully into the future.",
    metrics: [
      { label: "Phase", value: "Optimization & Growth" },
      { label: "Focus", value: "Continuous Enhancement" },
      { label: "Output", value: "Compounding Value" },
    ],
  },
];

export interface WhyAsteyaItem {
  number: string;
  title: string;
  description: string;
  badge: string;
}

export const WHY_ASTEYA_ITEMS: WhyAsteyaItem[] = [
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

export const PROCESS_STAGES = [
  { id: "01", name: "DISCOVER", detail: "Deep exploration of requirements, pain points, and target outcome" },
  { id: "02", name: "DEFINE", detail: "System architecture, scope definition, and technological foundation" },
  { id: "03", name: "DESIGN", detail: "High-fidelity interfaces, interactive flow diagrams, and design systems" },
  { id: "04", name: "DEVELOP", detail: "Clean, performant, type-safe full-stack implementation" },
  { id: "05", name: "TEST", detail: "Rigorous automated testing, security validation, and cross-platform QA" },
  { id: "06", name: "LAUNCH", detail: "Zero-downtime deployment, infrastructure verification, and telemetry active" },
  { id: "07", name: "EVOLVE", detail: "Continuous observability, iterative feature delivery, and performance tuning" },
];

export const TECH_DOMAINS = [
  { id: "ai", label: "AI", desc: "Machine intelligence & neural automation models", color: "#818cf8" },
  { id: "web", label: "WEB", desc: "Modern full-stack responsive web systems", color: "#38bdf8" },
  { id: "automation", label: "AUTOMATION", desc: "Autonomous workflows & business logic pipelines", color: "#a855f7" },
  { id: "cloud", label: "CLOUD", desc: "Serverless edge & scalable containerized infra", color: "#34d399" },
  { id: "digital-products", label: "DIGITAL PRODUCTS", desc: "End-to-end consumer & enterprise software", color: "#f472b6" },
  { id: "data", label: "DATA", desc: "Real-time analytics & intelligence streams", color: "#fb923c" },
  { id: "emerging-tech", label: "EMERGING TECHNOLOGY", desc: "Next-generation protocols and futuristic interfaces", color: "#60a5fa" },
];
