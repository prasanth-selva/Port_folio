import type { Metadata, Viewport } from "next";

import SmoothScroll from "@/components/providers/SmoothScroll";
import { getSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Manisha Nithya — Portfolio",
    template: "%s — Manisha Nithya",
  },
  description:
    "Portfolio of Manisha Nithya, B.E. CSE & Cybersecurity student graduating in 2029. Building secure systems, exploring web security, and learning in public.",
  keywords: [
    "Manisha Nithya",
    "cybersecurity",
    "computer science",
    "web security",
    "python",
    "portfolio",
  ],
  authors: [{ name: "Manisha Nithya" }],
  creator: "Manisha Nithya",
  openGraph: {
    type: "website",
    siteName: "Manisha Nithya",
    title: "Manisha Nithya — Portfolio",
    description:
      "B.E. CSE & Cybersecurity student building secure systems and documenting the journey.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manisha Nithya — Portfolio",
    description: "Building secure systems, one project at a time.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#050505"/><path d="M16 6l8 3v7c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V9l8-3z" fill="none" stroke="#ECEFF3" stroke-width="2"/><circle cx="16" cy="15" r="2.4" fill="#ECEFF3"/></svg>`
          ),
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings().catch(() => null);
  const seoTitle = settings?.seoTitle ?? "";
  const name = seoTitle.split("—")[0]?.trim() || "Manisha Nithya";

  return (
    <html lang="en">
      <body className="min-h-screen bg-base font-sans">
        <SmoothScroll>{children}</SmoothScroll>
        {/* JSON-LD Person schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name,
              email: `mailto:${settings?.email ?? "manishanithya7@gmail.com"}`,
              url: siteUrl,
              knowsAbout: [
                "Cybersecurity",
                "Web Security",
                "Computer Science",
                "Python",
                "Linux",
                "Data Structures",
              ],
              sameAs: [
                settings?.linkedin ?? "https://linkedin.com/in/manisha-nithya",
                settings?.github ?? "https://github.com/manisha-nithya",
              ].filter(Boolean),
            }),
          }}
        />
      </body>
    </html>
  );
}
