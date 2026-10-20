import React from "react";
import type { Metadata } from "next";
import { getPublicSiteContent } from "@/lib/server/content";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AboutPageClient } from "@/components/pages/AboutPageClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const title = "About Aadrut | Aadrut";
  const description =
    "Aadrut is a technology company creating digital products, intelligent solutions, and ventures designed for the future.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://asteya.tech/about",
    },
    openGraph: {
      title,
      description,
      url: "https://asteya.tech/about",
      siteName: "Aadrut",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@aadrut",
    },
  };
}

export default async function AboutPage() {
  const content = await getPublicSiteContent();
  const publishedTeam = (content.team || []).filter((m) => m.published);

  // Strict sanitization: ensure no CEO/CTO/COO titles in rendered tree or schemas
  const safeTeam = publishedTeam.map((m) => {
    const displayRole = /\b(ceo|cto|coo|chief\s+executive|chief\s+technology|chief\s+operating)\b/i.test(m.displayRole)
      ? "Leadership"
      : m.displayRole;
    return { ...m, displayRole };
  });

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Aadrut",
    url: "https://asteya.tech",
    logo: "https://asteya.tech/icon.png",
    description:
      content.about.headline ||
      "Aadrut engineers high-performance web applications, intelligent solutions, and modern technology ventures.",
    sameAs: ["https://linkedin.com/company/aadrut", "https://x.com/aadrut"],
  };

  const personSchemas = safeTeam.map((member) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.displayRole,
    worksFor: {
      "@type": "Organization",
      name: "Aadrut",
    },
    ...(member.photoUrl ? { image: `https://asteya.tech${member.photoUrl}` } : {}),
    ...(member.linkedinUrl ? { sameAs: [member.linkedinUrl] } : {}),
  }));

  // Prevent XSS / HTML injection in JSON-LD by escaping all '<' characters
  const jsonLdOrg = JSON.stringify(organizationSchema).replace(/</g, "\\u003c");
  const jsonLdPersons = personSchemas.map((schema) =>
    JSON.stringify(schema).replace(/</g, "\\u003c")
  );

  return (
    <PublicLayout content={content}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdOrg }}
      />
      {jsonLdPersons.map((jsonLd, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ))}
      <AboutPageClient about={content.about} team={safeTeam} />
    </PublicLayout>
  );
}
