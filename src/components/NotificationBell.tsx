"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  article_id: string;
  read: boolean;
  created_at: string;
  articles?: {
    title: string;
  };
}

export function NotificationBell() {
  const { user, getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 关闭下拉
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 登录后查通知
  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  // 首次加载
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // 标记全部已读
  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="nav-link rounded-full w-8 h-8 flex items-center justify-center transition-colors relative"
        style={{
          color: "var(--fg-muted)",
          backgroundColor: "transparent",
        }}
        title="通知"
      >
        {/* 铃铛 SVG */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 rounded-full text-[10px] font-bold leading-none flex items-center justify-center"
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
            maxHeight: "360px",
            overflowY: "auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          }}
        >
          {/* 标题栏 */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
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

          {/* 列表 */}
          {loading ? (
            <div className="p-4 text-center text-xs" style={{ color: "var(--fg-muted)" }}>
              加载中…
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-xs" style={{ color: "var(--fg-muted)" }}>
              暂无通知
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/article/${n.article_id}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 transition-colors hover:opacity-70"
                  style={{
                    backgroundColor: n.read ? "transparent" : "color-mix(in srgb, var(--accent) 4%, transparent)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <div
                        className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: "var(--accent)" }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                        有人回复了你的评论
                      </p>
                      <p
                        className="text-sm font-medium mt-0.5 truncate"
                        style={{ color: "var(--fg)" }}
                      >
                        {n.articles?.title || "查看详情"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                        {formatTime(n.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
