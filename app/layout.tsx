import type { Metadata, Viewport } from "next";
import { Inter, Oswald, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { RegisterSW } from "@/components/register-sw";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0F2347",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Bolão Copa 2026",
  description: "Bolão entre amigos para a Copa do Mundo 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bolão 2026",
  },
  openGraph: {
    title: "Bolão Copa 2026",
    description: "Aposte nos jogos da Copa do Mundo 2026 com seus amigos!",
    type: "website",
    locale: "pt_BR",
    siteName: "Bolão Copa 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bolão Copa 2026",
    description: "Aposte nos jogos da Copa do Mundo 2026 com seus amigos!",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="preconnect" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0F2347] text-white font-[var(--font-inter),system-ui,sans-serif]">
        {children}
        <RegisterSW />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
