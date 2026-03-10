import type { Metadata } from "next";
import "./globals.css";
import "../package/index.css";
import { AuthProvider } from "@/components/AuthContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://coreblock.in'),
  title: {
    default: "CoreBlock — AI, Agents & Tech by Hanish Jyosyabhatla",
    template: "%s | CoreBlock",
  },
  description: "CoreBlock is a platform that posts about AI, agents, AI/ML, tech content, web development, and all other stuff in the own words and experiences of Hanish Jyosyabhatla.",
  keywords: [
    "Hanish Jyosyabhatla",
    "Hanish",
    "CoreBlock",
    "AI",
    "AI Agents",
    "AIML",
    "Tech Content",
    "Web Development",
    "Software Engineering",
    "Software Development",
    "Hanish Jyosyabhatla Blog"
  ],
  authors: [{ name: "Hanish Jyosyabhatla", url: "https://coreblock.in" }],
  creator: "Hanish Jyosyabhatla",
  publisher: "Hanish Jyosyabhatla",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CoreBlock",
    title: "CoreBlock — AI, Agents & Tech by Hanish Jyosyabhatla",
    description: "Personal experiences and insights into AI, Agents, and modern web technologies by Hanish Jyosyabhatla.",
    images: [
      {
        url: "/og-image.png", // Ensure this exists or fallback to a default
        width: 1200,
        height: 630,
        alt: "CoreBlock — Hanish Jyosyabhatla",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoreBlock — AI, Agents & Tech by Hanish Jyosyabhatla",
    description: "Insights into AI and the future of tech by Hanish Jyosyabhatla.",
    creator: "@hanish_963", // Replace with actual handle if available
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Hanish Jyosyabhatla",
  "url": "https://coreblock.in",
  "jobTitle": "Software Developer & Tech Writer",
  "description": "Developer and creator of CoreBlock, writing about AI, agents, and web development.",
  "sameAs": [
    // Add social links here if known, e.g. linkedin, github, twitter
    "https://github.com/hanish-j",
  ]
};


import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-navy-950 font-sans antialiased">
        <Script id="excalidraw-config" strategy="beforeInteractive">
          {`window.EXCALIDRAW_ASSET_PATH = "/";`}
        </Script>
        <AuthProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
