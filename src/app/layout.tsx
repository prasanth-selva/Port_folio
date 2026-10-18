import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";

import SmoothScroll from "@/components/providers/SmoothScroll";
import { getSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prasanth Selva — Cybersecurity Engineer",
    template: "%s — Prasanth Selva",
  },
  description:
    "Portfolio of Prasanth Selva, a cybersecurity student working with SOC operations, web security, Python, Linux, and security tools.",
  keywords: [
    "Prasanth Selva",
    "cybersecurity",
    "SOC analyst",
    "penetration testing",
    "CTF",
    "web security",
    "portfolio",
  ],
  authors: [{ name: "Prasanth Selva" }],
  creator: "Prasanth Selva",
  openGraph: {
    type: "website",
    siteName: "Prasanth Selva",
    title: "Prasanth Selva — Cybersecurity Engineer",
    description:
      "Cybersecurity student projects, internships, certificates, and contact details.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prasanth Selva — Cybersecurity Engineer",
    description: "Cybersecurity projects, work history, and certificates.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#111111"/><path d="M16 6l8 3v7c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V9l8-3z" fill="none" stroke="#E3AE62" stroke-width="2"/><circle cx="16" cy="15" r="2.4" fill="#E3AE62"/></svg>`
          ),
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings().catch(() => null);
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-screen bg-base font-sans">
        <SmoothScroll>{children}</SmoothScroll>
        {/* JSON-LD Person schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Prasanth Selva",
              jobTitle: "Cybersecurity Engineer (aspiring)",
              email: `mailto:${settings?.email ?? "prasanthselvaraj1511@gmail.com"}`,
              url: siteUrl,
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "KGiSL Institute of Technology, Coimbatore",
              },
              knowsAbout: [
                "SOC operations",
                "AI-driven threat monitoring",
                "Linux",
                "Python",
                "SIEM",
                "IDS/IPS",
                "Web security",
              ],
              sameAs: [
                settings?.linkedin ?? "https://linkedin.com/in/prasanth-selva-1810aa315",
                settings?.github ?? "https://github.com/prasanth-selva",
              ].filter(Boolean),
            }),
          }}
        />
      </body>
    </html>
  );
}
