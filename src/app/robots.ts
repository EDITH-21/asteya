import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asteya.tech";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/faq", "/services/", "/privacy", "/terms"],
        disallow: ["/admin", "/admin/", "/api", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
