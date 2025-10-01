import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PWALifecycle } from "@/components/pwa-lifecycle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Undr.Ai",
  description: "All-in-one productivity app with PDF tools, QR code generator, and AI chat assistant",
  applicationName: "Undr.Ai",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Undr.Ai",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  keywords: ["PDF", "QR Code", "AI", "Chat", "Productivity", "Tools", "Utilities"],
  authors: [{ name: "Undr.Ai" }],
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Undr.Ai" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {children}
          </main>
          <Toaster />
          <PWAInstallPrompt />
          <PWALifecycle />
        </Providers>
      </body>
    </html>
  );
}
