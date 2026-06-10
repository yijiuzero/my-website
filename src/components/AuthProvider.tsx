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
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
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

async function fetchProfile(userId: string, accessToken: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=username,avatar_url`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` } }
  );
  const users = await res.json();
  return users?.[0] || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动时恢复 session
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setUser(stored.user);
      // 后台刷新 token
      fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON_KEY },
        body: JSON.stringify({ refresh_token: stored.refresh_token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.access_token) {
            const expires_at = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);
            localStorage.setItem(
              "sb-session",
              JSON.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token || stored.refresh_token,
                expires_at,
                user: stored.user,
              })
            );
          }
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON_KEY },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error_description || data.msg || "登录失败" };
      }

      const profile = await fetchProfile(data.user.id, data.access_token);
      const userObj: User = {
        id: data.user.id,
        email: data.user.email || email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
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

  const register = useCallback(async (email: string, password: string, username: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
