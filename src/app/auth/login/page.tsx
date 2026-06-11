"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError("请完成人机验证");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(email, password, captchaToken);
    setLoading(false);
    if (result.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "登录失败");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>登录零号站台</h1>
        <p className="auth-subtitle">欢迎回来 👋</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <label>
            <span>邮箱</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </label>

          <label>
            <span>密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>

          <TurnstileWidget
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
          />

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || !captchaToken}
          >
            {loading ? "登录中…" : !captchaToken ? "请先完成验证" : "登录"}
          </button>
        </form>

        <p className="auth-footer">
          还没有账号？<Link href="/auth/register">注册一个</Link>
        </p>
      </div>
    </div>
  );
}
