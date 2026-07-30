import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/components/SocketProvider";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://apexlistener.dev"),
  title: {
    default: "ApexListener | Watch YouTube Together",
    template: "%s | ApexListener",
  },
  description:
    "Watch YouTube videos together with friends in real-time. Precise synchronization, no login required, and premium UI.",
  keywords: [
    "youtube together",
    "watch party",
    "sync youtube videos",
    "real-time youtube",
    "apex listener",
    "watch videos with friends",
  ],
  authors: [{ name: "ApexListener Team" }],
  creator: "ApexListener",
  openGraph: {
    title: "ApexListener | Watch YouTube Together",
    description:
      "Watch YouTube videos together with friends in real-time. No login required.",
    url: "https://apexlistener.dev",
    siteName: "ApexListener",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexListener | Watch YouTube Together",
    description:
      "Watch YouTube videos together with friends in real-time. No login required.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <SocketProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0f1710",
                color: "#f0f4f0",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "'Inter', sans-serif",
              },
            }}
          />
          <Analytics />
        </SocketProvider>
      </body>
    </html>
  );
}
