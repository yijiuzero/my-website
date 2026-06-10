"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(email, password, username);
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
            验证邮件已发送到 <strong>{email}</strong>
            <br />
            点击邮件中的链接完成验证，然后回来登录。
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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "注册中…" : "注册"}
          </button>
        </form>

        <p className="auth-footer">
          已有账号？<Link href="/auth/login">去登录</Link>
        </p>
      </div>
    </div>
  );
}
