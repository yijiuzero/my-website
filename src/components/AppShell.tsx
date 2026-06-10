"use client";

import { AuthProvider, useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useRef, useEffect } from "react";

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="nav-link px-3 py-1.5 rounded-md text-sm transition-colors"
        style={{ color: "var(--fg-secondary)" }}
      >
        登录
      </Link>
    );
  }

  const initial = user.username?.[0] || user.email?.[0] || "?";

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="nav-link rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors"
        style={{
          color: "var(--fg)",
          backgroundColor: "var(--accent-soft)",
          border: "1px solid var(--border)",
        }}
        title={user.username || user.email}
      >
        {initial.toUpperCase()}
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            minWidth: "160px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "0.4rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.75rem",
              fontSize: "0.85rem",
              color: "var(--fg)",
              fontWeight: 500,
              borderBottom: "1px solid var(--border)",
              marginBottom: "0.25rem",
            }}
          >
            {user.username || user.email}
          </div>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="nav-link w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{ color: "var(--fg-secondary)" }}
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
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
              <UserMenu />
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
    </AuthProvider>
  );
}
