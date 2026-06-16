import type { Metadata } from "next";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PAGE_SIZE = 20;

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

async function getArticles(
  page: number
): Promise<{ articles: Article[]; total: number }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { articles: [], total: 0 };
  try {
    const offset = (page - 1) * PAGE_SIZE;
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=*&published=eq.true&order=created_at.desc&limit=${PAGE_SIZE}&offset=${offset}`,
      {
        headers: { ...headers, Prefer: "count=exact" },
        next: { revalidate: 60, tags: ["articles"] },
      }
    );
    if (!res.ok) return { articles: [], total: 0 };
    const articles: Article[] = await res.json();
    const contentRange = res.headers.get("content-range");
    let total = articles.length;
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) total = parseInt(match[1], 10);
    }
    return { articles, total };
  } catch {
    return { articles: [], total: 0 };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const categoryLabel: Record<string, string> = {
  tech: "技术",
  life: "生活",
  travel: "旅行",
  essay: "随笔",
};

export const metadata: Metadata = {
  title: "站台日志 · 零号站台",
  description: "阅读零号站台的所有文章：技术、随笔、生活。",
  alternates: { canonical: "https://www.121338.xyz/articles" },
  openGraph: {
    title: "站台日志 · 零号站台",
    description: "阅读零号站台的所有文章：技术、随笔、生活。",
    url: "https://www.121338.xyz/articles",
    siteName: "零号站台 · Platform Zero",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "站台日志 · 零号站台",
    description: "阅读零号站台的所有文章：技术、随笔、生活。",
  },
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(String(pageParam || "1"), 10) || 1);
  const { articles, total } = await getArticles(currentPage);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
        共 {total} 篇文章
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

      {/* ── 分页 ── */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10">
          {currentPage > 1 && (
            <Link
              href={`/articles?page=${currentPage - 1}`}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--fg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              上一页
            </Link>
          )}
          <span
            className="px-4 py-2 text-sm"
            style={{ color: "var(--fg-muted)" }}
          >
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/articles?page=${currentPage + 1}`}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--fg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              下一页
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
