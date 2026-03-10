import type { Metadata } from "next";
import "./globals.css";
import "../package/index.css";

export const metadata: Metadata = {
  title: {
    default: "CoreBlock — Modern Blog Platform",
    template: "%s | CoreBlock",
  },
  description: "CoreBlock is a modern, powerful blog platform built for creators and developers. Publish beautiful content with our rich text editor.",
  keywords: ["blog", "content", "writing", "developer", "coreblock", "publishing"],
  authors: [{ name: "CoreBlock" }],
  creator: "CoreBlock",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CoreBlock",
    title: "CoreBlock — Modern Blog Platform",
    description: "CoreBlock is a modern, powerful blog platform built for creators and developers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoreBlock — Modern Blog Platform",
    description: "CoreBlock is a modern, powerful blog platform built for creators and developers.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        {children}
      </body>
    </html>
  );
}
