import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.121338.xyz";
const SITE_NAME = "零号站台 · Platform Zero";
const SITE_DESC = "一个互联网上的落脚处。记录、分享、连接。";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESC,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESC,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://www.121338.xyz" />
        <link rel="dns-prefetch" href="https://www.121338.xyz" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
        <link rel="preconnect" href="https://static.cloudflareinsights.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <AppShell>{children}</AppShell>
    </html>
  );
}
