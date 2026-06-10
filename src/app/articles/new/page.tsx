"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "tech", label: "技术" },
  { value: "life", label: "生活" },
  { value: "travel", label: "旅行" },
  { value: "essay", label: "随笔" },
];

export default function NewArticlePage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("essay");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h1>请先登录</h1>
          <p className="auth-subtitle">发布文章需要登录账号</p>
          <Link href="/auth/login" className="auth-btn" style={{ display: "inline-block" }}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, content, category }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "发布失败");
        setLoading(false);
        return;
      }

      router.push(`/article/${data.id}`);
    } catch (e: any) {
      setError(e.message || "网络错误");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
          写篇文章
        </h1>
        <p style={{ color: "var(--fg-muted)" }}>把你的想法写下来，发布到站台上</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="auth-error">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给你的文章起个标题"
            required
            maxLength={200}
            className="w-full px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--fg)",
              fontSize: "1.1rem",
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>
            分类
          </label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: category === cat.value ? "var(--accent-soft)" : "var(--surface)",
                  color: category === cat.value ? "var(--accent)" : "var(--fg-secondary)",
                  border: `1px solid ${category === cat.value ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>
            内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在这里写下你的内容...&#10;支持 Markdown 语法"
            required
            rows={16}
            className="w-full px-4 py-3 rounded-lg border resize-y"
            style={{
              backgroundColor: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--fg)",
              fontSize: "1rem",
              lineHeight: 1.7,
              fontFamily: "var(--font-mono)",
            }}
          />
          <p className="mt-2 text-xs" style={{ color: "var(--fg-muted)" }}>
            {content.length} 字 · 支持 ## 标题、**粗体**、*斜体*、- 列表等 Markdown 语法
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="auth-btn"
            style={{ width: "auto", paddingLeft: "2rem", paddingRight: "2rem" }}
          >
            {loading ? "发布中…" : "发布文章"}
          </button>
          <Link
            href="/articles"
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--surface)",
              color: "var(--fg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
