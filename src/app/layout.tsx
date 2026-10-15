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

export const metadata: Metadata = {
  title: "Asteya — Building What's Next",
  description:
    "Asteya is a technology company creating digital products, intelligent solutions, and ventures designed for the future.",
  keywords: [
    "Asteya",
    "Technology Company",
    "Digital Products",
    "Attenza",
    "AI",
    "Web Engineering",
    "Business Automation",
    "Ventures",
  ],
  authors: [{ name: "Asteya" }],
  openGraph: {
    title: "Asteya — Building What's Next",
    description:
      "Asteya is a technology company creating digital products, intelligent solutions, and ventures designed for the future.",
    url: "https://asteya.tech",
    siteName: "Asteya",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asteya — Building What's Next",
    description:
      "Asteya is a technology company creating digital products, intelligent solutions, and ventures designed for the future.",
  },
  icons: {
    icon: "/asteya-logo-original.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="bg-[#05070b] text-[#f1f5f9] antialiased selection:bg-indigo-500/30 selection:text-white min-h-screen">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
