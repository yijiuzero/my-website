"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AccountPage() {
  const { user, getToken, loading } = useAuth();
  const router = useRouter();

  // 用户名
  const [username, setUsername] = useState("");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [savingUser, setSavingUser] = useState(false);

  // 密码
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user]);

  if (loading || !user) return null;

  const handleSaveUsername = async () => {
    const trimmed = username.trim();
    if (!trimmed) { setUsernameMsg("用户名不能为空"); return; }
    if (trimmed.length > 30) { setUsernameMsg("最多 30 个字符"); return; }
    setSavingUser(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsernameMsg("用户名已更新");
        // 更新本地存储
        const raw = localStorage.getItem("sb-session");
        if (raw) {
          const session = JSON.parse(raw);
          session.user.username = data.username || trimmed;
          localStorage.setItem("sb-session", JSON.stringify(session));
        }
      } else {
        setUsernameMsg(data.error || "修改失败");
      }
    } catch {
      setUsernameMsg("网络错误");
    } finally {
      setSavingUser(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPw) { setPwMsg("请输入当前密码"); setPwError(true); return; }
    if (!newPw) { setPwMsg("请输入新密码"); setPwError(true); return; }
    if (newPw.length < 6) { setPwMsg("新密码至少 6 位"); setPwError(true); return; }
    setSavingPw(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg("密码已更新");
        setPwError(false);
        setCurrentPw("");
        setNewPw("");
      } else {
        setPwMsg(data.error || "修改失败");
        setPwError(true);
      }
    } catch {
      setPwMsg("网络错误");
      setPwError(true);
    } finally {
      setSavingPw(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem 0.75rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg)",
    color: "var(--fg)",
    fontSize: "0.95rem",
    outline: "none",
  };

  const btnStyle: React.CSSProperties = {
    padding: "0.55rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    backgroundColor: "var(--accent)",
    color: "white",
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-12">
      <h1
        className="text-2xl font-bold mb-8"
        style={{ color: "var(--fg)" }}
      >
        账号管理
      </h1>

      {/* ── 修改用户名 ── */}
      <section
        className="p-6 rounded-xl mb-6"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--fg)" }}>
          修改用户名
        </h2>
        <label className="block mb-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          当前邮箱：{user.email}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setUsernameMsg(""); }}
          placeholder="输入新用户名"
          style={inputStyle}
        />
        <div className="flex items-center justify-between mt-3">
          <span
            className="text-sm"
            style={{ color: "var(--fg-muted)" }}
          >
            {usernameMsg}
          </span>
          <button onClick={handleSaveUsername} disabled={savingUser} style={btnStyle}>
            {savingUser ? "保存中…" : "保存"}
          </button>
        </div>
      </section>

      {/* ── 修改密码 ── */}
      <section
        className="p-6 rounded-xl"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--fg)" }}>
          修改密码
        </h2>
        <div className="mb-3">
          <label className="block mb-1 text-sm" style={{ color: "var(--fg-muted)" }}>
            当前密码
          </label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => { setCurrentPw(e.target.value); setPwMsg(""); }}
            style={inputStyle}
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm" style={{ color: "var(--fg-muted)" }}>
            新密码（至少 6 位）
          </label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => { setNewPw(e.target.value); setPwMsg(""); }}
            style={inputStyle}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span
            className="text-sm"
            style={pwError ? { color: "#ef4444" } : { color: "var(--fg-muted)" }}
          >
            {pwMsg}
          </span>
          <button onClick={handleSavePassword} disabled={savingPw} style={btnStyle}>
            {savingPw ? "保存中…" : "修改密码"}
          </button>
        </div>
      </section>
    </div>
  );
}
