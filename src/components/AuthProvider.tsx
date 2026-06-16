"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  getToken: () => string | null;
  updateUser: (patch: Partial<Pick<User, "username" | "avatar_url">>) => void;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, username: string, captchaToken?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  getToken: () => null,
  updateUser: () => {},
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getStoredSession() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("sb-session");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.expires_at && Date.now() / 1000 < parsed.expires_at) return parsed;
    localStorage.removeItem("sb-session");
    return null;
  } catch {
    localStorage.removeItem("sb-session");
    return null;
  }
}

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 分钟刷新一次

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 刷新 token 的通用逻辑，返回是否成功
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const raw = localStorage.getItem("sb-session");
    if (!raw) return false;
    let stored: Record<string, unknown>;
    try {
      stored = JSON.parse(raw);
    } catch {
      return false;
    }
    const refreshToken = stored.refresh_token as string;
    if (!refreshToken) return false;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: ANON_KEY },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );
      const data = await res.json();
      if (!data.access_token) return false;
      const expires_at =
        Math.floor(Date.now() / 1000) + (data.expires_in || 3600);
      localStorage.setItem(
        "sb-session",
        JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token || refreshToken,
          expires_at,
          user: stored.user,
        })
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  // 启动时恢复 session + 定时刷新
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setUser(stored.user);
      // 首次后台刷新
      refreshSession();
    }
    setLoading(false);

    // 定时刷新，失败则登出
    const timer = window.setInterval(async () => {
      const ok = await refreshSession();
      if (!ok) {
        localStorage.removeItem("sb-session");
        setUser(null);
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string, captchaToken?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken: captchaToken || "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "登录失败" };
      }

      const userObj: User = {
        id: data.user.id,
        email: data.user.email || email,
        username: data.user?.username,
        avatar_url: data.user?.avatar_url,
      };

      const expires_at = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);
      localStorage.setItem(
        "sb-session",
        JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at,
          user: userObj,
        })
      );
      setUser(userObj);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username: string, captchaToken?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, captchaToken: captchaToken || "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "注册失败" };
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }, []);

  const getToken = useCallback((): string | null => {
    const stored = getStoredSession();
    return stored?.access_token || null;
  }, []);

  const updateUser = useCallback((patch: Partial<Pick<User, "username" | "avatar_url">>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
    // 同步更新 localStorage 中的 user
    const raw = localStorage.getItem("sb-session");
    if (raw) {
      const session = JSON.parse(raw);
      session.user = { ...session.user, ...patch };
      localStorage.setItem("sb-session", JSON.stringify(session));
    }
  }, []);

  const logout = useCallback(async () => {
    const stored = getStoredSession();
    if (stored?.access_token) {
      fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${stored.access_token}` },
      }).catch(() => {});
    }
    localStorage.removeItem("sb-session");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, getToken, updateUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
