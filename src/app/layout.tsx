import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { getSiteUrl } from "@/lib/site-url";
import { getPublicSiteContent } from "@/lib/server/content";

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

const siteUrl = getSiteUrl();

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
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Aadrut | Digital Products, Intelligent Solutions & Future Ventures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aadrut | Digital Products, Intelligent Solutions & Future Ventures",
    description:
      "Aadrut builds high-performance web applications, custom digital solutions, brand design systems, and intelligent business automations for high-growth enterprises.",
    creator: "@aadrut",
    images: [`${siteUrl}/opengraph-image`],
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getPublicSiteContent();
  const dynamicContactEmail =
    content.settings?.contactEmail ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "hello@aadrut.com";
  const dynamicInstagram =
    content.settings?.instagramUrl || process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";
  const dynamicLinkedin =
    content.settings?.linkedinUrl || process.env.NEXT_PUBLIC_LINKEDIN_URL || "";
  const dynamicSameAs = [dynamicInstagram, dynamicLinkedin].filter(Boolean) as string[];

  const dynamicJsonLd = {
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
        "sameAs": dynamicSameAs,
        "contactPoint": {
          "@type": "ContactPoint",
          "email": dynamicContactEmail,
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

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dynamicJsonLd).replace(/</g, "\\u003c") }}
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
