"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1>出了点问题</h1>
        <p
          className="auth-subtitle"
          style={{ marginBottom: "1.5rem" }}
        >
          页面加载时遇到了错误，请稍后再试。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button onClick={reset} className="auth-btn" style={{ width: "auto" }}>
            重试
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{
              display: "inline-block",
              backgroundColor: "var(--surface)",
              color: "var(--fg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
