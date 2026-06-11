"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError("请完成人机验证");
      return;
    }
    setError("");
    setLoading(true);
    const result = await register(email, password, username, captchaToken);
    setLoading(false);
    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error || "注册失败");
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>🎉 注册成功</h1>
          <p className="auth-subtitle">
            你的账号 <strong>{email}</strong> 已创建完成
            <br />
            现在可以登录了
          </p>
          <Link href="/auth/login" className="auth-btn" style={{ display: "inline-block", textAlign: "center", marginTop: "1.5rem" }}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>加入零号站台</h1>
        <p className="auth-subtitle">站长之家，从注册开始 🚉</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <label>
            <span>用户名</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="你的名字"
              required
              minLength={2}
              maxLength={24}
              autoFocus
            />
          </label>

          <label>
            <span>邮箱</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </label>

          <label>
            <span>密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
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
            {loading ? "注册中…" : !captchaToken ? "请先完成验证" : "注册"}
          </button>
        </form>

        <p className="auth-footer">
          已有账号？<Link href="/auth/login">去登录</Link>
        </p>
      </div>
    </div>
  );
}
