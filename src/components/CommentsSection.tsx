"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  users?: {
    username: string;
    avatar_url: string | null;
  };
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function CommentsSection({ articleId }: { articleId: string }) {
  const { user, getToken } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch {
      // 静默失败
    } finally {
      setFetching(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "评论失败");
        setLoading(false);
        return;
      }

      setContent("");
      await fetchComments(); // 刷新评论列表
    } catch (e: any) {
      setError(e.message || "网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2
        className="text-lg font-semibold mb-6"
        style={{ color: "var(--fg)" }}
      >
        评论 ({comments.length})
      </h2>

      {/* 评论表单 */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {error && (
            <div className="auth-error mb-3">{error}</div>
          )}
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError("");
            }}
            placeholder="写下你的想法…"
            rows={3}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-lg border resize-y"
            style={{
              backgroundColor: "var(--bg)",
              borderColor: error ? "#fca5a5" : "var(--border)",
              color: "var(--fg)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
              {content.length}/2000
            </span>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: content.trim() ? "var(--accent)" : "var(--border)",
                color: content.trim() ? "white" : "var(--fg-muted)",
                cursor: content.trim() ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "发送中…" : "发表评论"}
            </button>
          </div>
        </form>
      ) : (
        <div
          className="rounded-lg border p-4 mb-8 text-center text-sm"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface-raised)",
            color: "var(--fg-muted)",
          }}
        >
          <Link
            href="/auth/login"
            style={{ color: "var(--accent)", fontWeight: 500 }}
          >
            登录
          </Link>
          {" "}后可以发表评论
        </div>
      )}

      {/* 评论列表 */}
      {fetching ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border p-5"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: "var(--border)" }}
                />
                <div
                  className="h-3 w-16 rounded"
                  style={{ backgroundColor: "var(--border)" }}
                />
              </div>
              <div
                className="h-3 w-3/4 rounded"
                style={{ backgroundColor: "var(--border)" }}
              />
              <div
                className="h-3 w-1/2 rounded mt-2"
                style={{ backgroundColor: "var(--border)" }}
              />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
            还没有评论，说点什么吧
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border p-5 animate-fade-up"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {(comment.users?.username || "匿").charAt(0)}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--fg)" }}
                >
                  {comment.users?.username || "匿名"}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {formatTime(comment.created_at)}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--fg-secondary)" }}
              >
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
