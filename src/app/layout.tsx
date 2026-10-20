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
    default: "Aadrut | Digital Products, Intelligent Solutions & Future Ventures",
    template: "%s | Aadrut",
  },
  description:
    "Aadrut builds high-performance web applications, custom digital solutions, brand design systems, and intelligent business automations for high-growth enterprises.",
  authors: [{ name: "Aadrut", url: siteUrl }],
  creator: "Aadrut",
  publisher: "Aadrut",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Aadrut | Digital Products, Intelligent Solutions & Future Ventures",
    description:
      "Aadrut builds high-performance web applications, custom digital solutions, brand design systems, and intelligent business automations for high-growth enterprises.",
    url: siteUrl,
    siteName: "Aadrut",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aadrut | Digital Products, Intelligent Solutions & Future Ventures",
    description:
      "Aadrut builds high-performance web applications, custom digital solutions, brand design systems, and intelligent business automations for high-growth enterprises.",
    creator: "@aadrut",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
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
      "name": "Aadrut",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/aadrut-logo.png`,
        "width": "272",
        "height": "339",
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
      "name": "Aadrut",
      "description": "Digital Products, Intelligent Solutions & Future Ventures",
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
