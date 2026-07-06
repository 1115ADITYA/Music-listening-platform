import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/components/SocketProvider";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://apexlistener.dev"),
  title: {
    default: "ApexListener | Watch YouTube Together",
    template: "%s | ApexListener",
  },
  description: "Watch YouTube videos together with friends in real-time. Precise synchronization, no login required, and premium UI.",
  keywords: ["youtube together", "watch party", "sync youtube videos", "real-time youtube", "apex listener", "watch videos with friends"],
  authors: [{ name: "ApexListener Team" }],
  creator: "ApexListener",
  openGraph: {
    title: "ApexListener | Watch YouTube Together",
    description: "Watch YouTube videos together with friends in real-time. No login required.",
    url: "https://apexlistener.dev",
    siteName: "ApexListener",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexListener | Watch YouTube Together",
    description: "Watch YouTube videos together with friends in real-time. No login required.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen selection:bg-purple-500/30`}>
        <SocketProvider>
          {children}
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid #27272a',
            },
          }} />
          <Analytics />
        </SocketProvider>
      </body>
    </html>
  );
}
