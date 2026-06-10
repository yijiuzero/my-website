import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";

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

async function getArticles(): Promise<Article[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=*&published=eq.true&order=created_at.desc`,
      { headers, next: { revalidate: 0 } }
    );
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const categoryLabel: Record<string, string> = {
  tech: "技术",
  life: "生活",
  travel: "旅行",
  essay: "随笔",
};

export const metadata = {
  title: "站台日志 · 零号站台",
  description: "所有文章",
};

export default async function ArticlesPage() {
  const articles = await getArticles();

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

      {/* ── 标题 ── */}
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--fg)" }}
      >
        站台日志
      </h1>
      <p
        className="text-sm mb-10"
        style={{ color: "var(--fg-muted)" }}
      >
        共 {articles.length} 篇文章
      </p>

      {/* ── 列表 ── */}
      {articles.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
            还没有文章
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article, i) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="card-interactive block group rounded-xl border p-5 animate-fade-up"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div className="flex items-baseline gap-3 mb-2">
                {article.category && categoryLabel[article.category] && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{
                      backgroundColor: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {categoryLabel[article.category]}
                  </span>
                )}
                <span
                  className="text-xs flex-shrink-0"
                  style={{ color: "var(--fg-dim)" }}
                >
                  {formatDate(article.created_at)}
                </span>
              </div>
              <h2
                className="font-medium group-hover:underline"
                style={{ color: "var(--fg)" }}
              >
                {article.title}
              </h2>
              {article.content && (
                <p
                  className="text-sm line-clamp-2 leading-relaxed mt-1.5"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {stripMarkdown(article.content)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
