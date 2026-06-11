"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  parent_id: string | null;
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

/* ── 单条评论组件 ── */
function CommentItem({
  comment,
  replies,
  replyingTo,
  onReply,
  onCancelReply,
  replyLoading,
  replyContent,
  onReplyContentChange,
  onReplySubmit,
  allComments,
}: {
  comment: Comment;
  replies: Comment[];
  replyingTo: string | null;
  onReply: (id: string) => void;
  onCancelReply: () => void;
  replyLoading: boolean;
  replyContent: string;
  onReplyContentChange: (v: string) => void;
  onReplySubmit: (e: React.FormEvent) => void;
  allComments: Comment[];
}) {
  const { user } = useAuth();
  const parentAuthor = comment.parent_id
    ? allComments.find((c) => c.id === comment.parent_id)?.users?.username
    : null;

  return (
    <div>
      {/* 回复了别人的提示 */}
      {parentAuthor && (
        <div
          className="text-xs mb-1 ml-1"
          style={{ color: "var(--fg-muted)" }}
        >
          回复 <span style={{ color: "var(--accent)" }}>@{parentAuthor}</span>
        </div>
      )}

      <div
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
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
            {formatTime(comment.created_at)}
          </span>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--fg-secondary)" }}
        >
          {comment.content}
        </p>

        {/* 回复按钮 */}
        {user && !comment.parent_id && (
          <button
            onClick={() => onReply(comment.id)}
            className="text-xs mt-2 hover:underline"
            style={{ color: "var(--fg-muted)" }}
          >
            回复
          </button>
        )}
      </div>

      {/* 子回复列表 */}
      {replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 pl-4" style={{ borderColor: "var(--border)" }}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              replyingTo={replyingTo}
              onReply={onReply}
              onCancelReply={onCancelReply}
              replyLoading={replyLoading}
              replyContent={replyContent}
              onReplyContentChange={onReplyContentChange}
              onReplySubmit={onReplySubmit}
              allComments={allComments}
            />
          ))}
        </div>
      )}

      {/* 当前评论的回复表单 */}
      {replyingTo === comment.id && (
        <div className="ml-8 mt-2 border-l-2 pl-4" style={{ borderColor: "var(--border)" }}>
          <ReplyForm
            loading={replyLoading}
            content={replyContent}
            onChange={onReplyContentChange}
            onSubmit={onReplySubmit}
            onCancel={onCancelReply}
          />
        </div>
      )}
    </div>
  );
}

/* ── 回复表单子组件 ── */
function ReplyForm({
  loading,
  content,
  onChange,
  onSubmit,
  onCancel,
}: {
  loading: boolean;
  content: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-2">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="写下你的回复…"
        rows={2}
        maxLength={2000}
        className="w-full px-3 py-2 rounded-lg border resize-y text-sm"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--border)",
          color: "var(--fg)",
          lineHeight: 1.6,
        }}
      />
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
          {content.length}/2000
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              color: "var(--fg-muted)",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: content.trim() ? "var(--accent)" : "var(--border)",
              color: content.trim() ? "white" : "var(--fg-muted)",
              cursor: content.trim() ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "发送中…" : "回复"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ── 主评论区块 ── */
export function CommentsSection({ articleId }: { articleId: string }) {
  const { user, getToken } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // 回复状态
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

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
      await fetchComments();
    } catch (e: any) {
      setError(e.message || "网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;
    setReplyLoading(true);

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          parent_id: replyingTo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "回复失败");
        setReplyLoading(false);
        return;
      }

      setReplyContent("");
      setReplyingTo(null);
      await fetchComments();
    } catch (e: any) {
      setError(e.message || "网络错误");
    } finally {
      setReplyLoading(false);
    }
  };

  // 分组：顶层评论 + 子回复
  const topLevel = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

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
          {error && !replyingTo && (
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
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              replyingTo={replyingTo}
              onReply={setReplyingTo}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyContent("");
              }}
              replyLoading={replyLoading}
              replyContent={replyContent}
              onReplyContentChange={setReplyContent}
              onReplySubmit={handleReplySubmit}
              allComments={comments}
            />
          ))}
        </div>
      )}
    </section>
  );
}
