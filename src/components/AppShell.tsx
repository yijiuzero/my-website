"use client";

import { AuthProvider, useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useRef, useEffect } from "react";

interface Notification {
  id: string;
  type: string;
  article_id: string;
  read: boolean;
  created_at: string;
  articles?: { title: string };
}

function UserMenu() {
  const { user, getToken, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 通知状态
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setNotifications(await res.json());
    } catch { /* ignore */ }
  };

  // 定时刷新未读数
  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, [user]);

  // 点击外部关闭
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  const formatTime = (s: string) =>
    new Date(s).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleToggle = () => {
    if (!open) fetchNotifications();
    setOpen(!open);
  };

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
        onClick={handleToggle}
        className="nav-link rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors relative"
        style={{
          color: "var(--fg)",
          backgroundColor: "var(--accent-soft)",
          border: "1px solid var(--border)",
        }}
        title={user.username || user.email}
      >
        {initial.toUpperCase()}
        {/* 未读红点 */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none"
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              minWidth: "16px",
              height: "16px",
              padding: "0 3px",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            width: "300px",
            maxHeight: "380px",
            overflowY: "auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "0.4rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          }}
        >
          {/* 用户信息 */}
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

          {/* 通知列表 */}
          {notifications.length > 0 && (
            <div style={{ borderBottom: "1px solid var(--border)", marginBottom: "0.25rem", paddingBottom: "0.25rem" }}>
              <div
                className="flex items-center justify-between px-2 py-1.5"
              >
                <span className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
                  通知 {unreadCount > 0 && `(${unreadCount})`}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    全部已读
                  </button>
                )}
              </div>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {notifications.slice(0, 5).map((n) => (
                  <Link
                    key={n.id}
                    href={`/article/${n.article_id}`}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-2 rounded-md transition-colors"
                    style={{
                      backgroundColor: n.read ? "transparent" : "color-mix(in srgb, var(--accent) 4%, transparent)",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <div
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "var(--accent)" }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                          有人回复了你的评论
                        </p>
                        <p className="text-xs font-medium mt-0.5 truncate" style={{ color: "var(--fg)" }}>
                          {n.articles?.title || "查看详情"}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-muted)" }}>
                          {formatTime(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 操作菜单 */}
          <Link
            href="/auth/account"
            onClick={() => setOpen(false)}
            className="nav-link block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{ color: "var(--fg-secondary)" }}
          >
            账号管理
          </Link>
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

function NavLinks() {
  const { user } = useAuth();
  return (
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
      {user && (
        <Link
          href="/articles/new"
          className="nav-link px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          style={{ color: "var(--accent)" }}
        >
          写文章
        </Link>
      )}
      <ThemeToggle />
      <UserMenu />
    </nav>
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
            <NavLinks />
          </div>
        </header>

        <main className="flex-1">{children}</main>

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
