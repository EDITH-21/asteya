import React from "react";
import type { Metadata } from "next";
import { getPublicSiteContent } from "@/lib/server/content";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FaqPageClient } from "@/components/pages/FaqPageClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Frequently Asked Questions | Aadrut";
  const description =
    "Frequently asked questions about Aadrut's digital engineering services, technology ventures, engagement process, and client partnerships.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://asteya.tech/faq",
    },
    openGraph: {
      title,
      description,
      url: "https://asteya.tech/faq",
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

export default async function FaqPage() {
  const content = await getPublicSiteContent();
  const publishedFaqs = (content.faqs || []).filter((f) => f.published);

  // Construct FAQPage Schema.org structured data only from published items
  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: publishedFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Prevent XSS / HTML injection in JSON-LD by escaping all '<' characters
  const jsonLdFaq = JSON.stringify(faqPageSchema).replace(/</g, "\\u003c");

  return (
    <PublicLayout content={content}>
      {publishedFaqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdFaq }}
        />
      )}
      <FaqPageClient faqs={publishedFaqs} />
    </PublicLayout>
  );
}
