import React from "react";
import type { Metadata } from "next";
import { CONTACT_CONFIG } from "@/lib/constants";
import { getPublicSiteContent } from "@/lib/server/content";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Policy | Aadrut",
  description: "Aadrut's commitment to protecting user privacy, data security, and client confidentiality.",
  alternates: {
    canonical: "https://asteya.tech/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Aadrut",
    description: "Aadrut's commitment to protecting user privacy, data security, and client confidentiality.",
    url: "https://asteya.tech/privacy",
    siteName: "Aadrut",
    type: "website",
  },
};

export default async function PrivacyPage() {
  const content = await getPublicSiteContent();

  return (
    <PublicLayout content={content}>
      <main className="flex-1 pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
              <span>Legal Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              Privacy Policy
            </h1>
            <p className="text-sm font-sans text-slate-400">
              Last updated: October 2026 &bull; Effective immediately
            </p>
          </div>

          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">1. Commitment to Privacy</h2>
              <p>
                Aadrut (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is dedicated to safeguarding the privacy and confidential data of our website visitors, clients, and partners. This policy outlines how we collect, handle, and protect information submitted across our digital platforms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">2. Information We Collect</h2>
              <p>
                When you interact with our website or submit an inquiry, we collect only the necessary information to provide our services and respond to your requests:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li><strong className="text-slate-200">Contact Details:</strong> Your name, work email address, and company affiliation.</li>
                <li><strong className="text-slate-200">Project Overview:</strong> Technical briefs, engagement domains, timeline requirements, and project descriptions.</li>
                <li><strong className="text-slate-200">Technical Data:</strong> Anonymized server logs, browser type, and IP address collected strictly for security rate limiting and fraud prevention.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">3. How Information is Used</h2>
              <p>
                All data collected is used solely to evaluate technical scope, respond to business inquiries, execute consulting agreements, and ensure the security of our platforms. We never sell, rent, or trade personal data to third parties or advertising networks.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">4. Data Retention &amp; Security</h2>
              <p>
                We employ strict industry-standard technical measures, including cryptographic token verification, sanitized parameterized queries, strict Content Security Policies, and access control restrictions to prevent unauthorized access or disclosure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">5. Contact &amp; Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data at any time by contacting our engineering and leadership team at{" "}
                <a href={`mailto:${CONTACT_CONFIG.email}`} className="text-indigo-400 hover:underline">
                  {CONTACT_CONFIG.email}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
