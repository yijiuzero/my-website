import Link from "next/link";
import { notFound } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SUPABASE_ANON_KEY || "",
  Authorization: `Bearer ${SUPABASE_ANON_KEY || ""}`,
  "Content-Type": "application/json",
};

interface Article {
  id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  author_name: string | null;
  created_at: string;
}

async function getArticle(id: string): Promise<Article | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?id=eq.${id}&select=*`,
      { headers }
    );
    const data = await res.json();
    return data[0] || null;
  } catch {
    return null;
  }
}

async function getComments(articleId: string): Promise<Comment[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/comments?article_id=eq.${articleId}&select=*&order=created_at.desc`,
      { headers }
    );
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
}

function estimateReadTime(content: string): number {
  const chars = content.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(chars / 500));
}

const categoryLabel: Record<string, string> = {
  tech: "技术",
  life: "生活",
  travel: "旅行",
  essay: "随笔",
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const comments = await getComments(id);
  const readTime = estimateReadTime(article.content || "");

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 md:py-12">
      {/* ── 返回 ── */}
      <div className="mb-8">
        <Link
          href="/"
          className="nav-link inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "var(--fg-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          返回站台
        </Link>
      </div>

      {/* ── 文章 ── */}
      <article>
        {/* 元信息 */}
        <div className="mb-8">
          {article.category && categoryLabel[article.category] && (
            <span
              className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium mb-3"
              style={{
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              {categoryLabel[article.category]}
            </span>
          )}
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-tight"
            style={{ color: "var(--fg)" }}
          >
            {article.title}
          </h1>
          <div
            className="flex items-center gap-3 text-sm"
            style={{ color: "var(--fg-muted)" }}
          >
            <time>{formatDate(article.created_at)}</time>
            <span style={{ color: "var(--border)" }}>·</span>
            <span>{readTime} 分钟阅读</span>
          </div>
        </div>

        {/* 正文 */}
        <div
          className="prose-station pb-8 mb-8"
          style={{ borderBottom: `1px solid var(--border)` }}
        >
          {article.content ? (
            article.content.split("\n").map((line, i) => {
              if (line.trim() === "") {
                return <div key={i} className="h-3" />;
              }
              // 简单标题检测
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i}>{line.replace("## ", "")}</h2>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h3 key={i}>{line.replace("### ", "")}</h3>
                );
              }
              return <p key={i}>{line}</p>;
            })
          ) : (
            <p style={{ color: "var(--fg-muted)" }}>暂无内容</p>
          )}
        </div>
      </article>

      {/* ── 评论区 ── */}
      <section>
        <h2
          className="text-lg font-semibold mb-6"
          style={{ color: "var(--fg)" }}
        >
          评论 ({comments.length})
        </h2>

        {comments.length === 0 ? (
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
                className="rounded-xl border p-5"
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
                    {(comment.author_name || "匿").charAt(0)}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--fg)" }}
                  >
                    {comment.author_name || "匿名"}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--fg-dim)" }}
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
    </div>
  );
}
