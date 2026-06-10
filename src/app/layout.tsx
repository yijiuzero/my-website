import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "零号站台 · Platform Zero",
  description: "一个互联网上的落脚处。记录、分享、连接。",
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
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
        }}
      >
        {/* ── 导航 ── */}
        <header
          className="sticky top-0 z-50 border-b"
          style={{
            backgroundColor: "color-mix(in srgb, var(--bg) 80%, transparent)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderColor: "var(--border)",
          }}
        >
          <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-bold text-base tracking-tight hover:opacity-70 transition-opacity"
              style={{ color: "var(--fg)" }}
            >
              零号站台
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="nav-link px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{ color: "var(--fg-secondary)" }}
              >
                首页
              </Link>
              <Link
                href="/articles"
                className="nav-link px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{ color: "var(--fg-secondary)" }}
              >
                日志
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* ── 底部 ── */}
        <footer
          className="border-t py-8 text-center text-sm"
          style={{
            borderColor: "var(--border)",
            color: "var(--fg-muted)",
          }}
        >
          <div className="max-w-4xl mx-auto px-5">
            <p className="mb-1">零号站台 &copy; {new Date().getFullYear()}</p>
            <p>互联网上的一个小小落脚处</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
