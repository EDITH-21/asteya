import React from "react";
import type { Metadata } from "next";
import { getPublicSiteContent } from "@/lib/server/content";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 60;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Terms of Service | Aadrut",
  description: "Aadrut's terms and conditions governing the use of our website, consulting services, and digital products.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: "Terms of Service | Aadrut",
    description: "Aadrut's terms and conditions governing the use of our website, consulting services, and digital products.",
    url: `${siteUrl}/terms`,
    siteName: "Aadrut",
    type: "website",
  },
};

export default async function TermsPage() {
  const content = await getPublicSiteContent();
  const contactEmail = content.settings?.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@aadrut.com";

  return (
    <PublicLayout content={content}>
      <main className="flex-1 pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium">
              <span>Legal Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              Terms of Service
            </h1>
            <p className="text-sm font-sans text-slate-400">
              Last updated: October 2026 &bull; Effective immediately
            </p>
          </div>

          <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">1. Acceptance of Terms</h2>
              <p>
                By accessing and utilizing the Aadrut website or engaging our technology consulting and software engineering services, you agree to comply with and be bound by these Terms of Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">2. Intellectual Property</h2>
              <p>
                All original materials, codebases, design assets, and brand marks created by Aadrut prior to or independently of specific client engagements remain the intellectual property of Aadrut. Client deliverables are governed under individual Master Services Agreements (MSAs) or Statements of Work (SOWs).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">3. Client Engagements &amp; Deliverables</h2>
              <p>
                Specific scopes of work, milestones, payment schedules, and deliverable specifications are established in dedicated project agreements executed between Aadrut and the client.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">4. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Aadrut shall not be liable for indirect, incidental, special, consequential, or punitive damages resulting from the use of our website or software beyond the explicit terms outlined in active client contracts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">5. Inquiries &amp; Legal Notices</h2>
              <p>
                For legal notices or questions regarding these Terms, contact our legal and leadership team directly at{" "}
                <a href={`mailto:${contactEmail}`} className="text-indigo-400 hover:underline">
                  {contactEmail}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
