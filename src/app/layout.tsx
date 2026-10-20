import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asteya.tech";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Asteya | Web Development, Business Automation & Digital Solutions",
    template: "%s | Asteya",
  },
  description:
    "Asteya builds high-performance web applications, custom digital solutions, brand design systems, and intelligent business automations for high-growth enterprises.",
  authors: [{ name: "Asteya", url: siteUrl }],
  creator: "Asteya",
  publisher: "Asteya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Asteya | Web Development, Business Automation & Digital Solutions",
    description:
      "Asteya builds high-performance web applications, custom digital solutions, brand design systems, and intelligent business automations for high-growth enterprises.",
    url: siteUrl,
    siteName: "Asteya",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asteya | Web Development, Business Automation & Digital Solutions",
    description:
      "Asteya builds high-performance web applications, custom digital solutions, brand design systems, and intelligent business automations for high-growth enterprises.",
    creator: "@asteya",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/asteya-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/asteya-logo-original.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Asteya",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/asteya-logo.svg`,
        "width": "736",
        "height": "736",
      },
      "sameAs": [
        "https://www.instagram.com/asteya.tech/",
        process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/company/asteya",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@asteya.tech",
        "contactType": "sales & inquiries",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Asteya",
      "description": "Web Development, Business Automation & Digital Solutions",
      "publisher": {
        "@id": `${siteUrl}/#organization`,
      },
      "inLanguage": "en-US",
    },
    {
      "@type": "Service",
      "serviceType": "Web Development",
      "provider": {
        "@id": `${siteUrl}/#organization`,
      },
      "description": "Modern, responsive, scalable websites and web applications built with Next.js, React, and TypeScript.",
    },
    {
      "@type": "Service",
      "serviceType": "Business Automation",
      "provider": {
        "@id": `${siteUrl}/#organization`,
      },
      "description": "Autonomous workflows, CRM integrations, and data pipelines that streamline operational productivity.",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="bg-[#05070b] text-[#f1f5f9] antialiased selection:bg-indigo-500/30 selection:text-white min-h-[100svh]">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
