import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentsSection } from "@/components/CommentsSection";
import { MarkdownContent } from "@/components/MarkdownContent";
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

async function getArticle(id: string): Promise<Article | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?id=eq.${id}&select=*`,
      { headers, next: { revalidate: 300 } }
    );
    const data = await res.json();
    return data[0] || null;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function estimateReadTime(content: string): number {
  const chars = content.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(chars / 500));
}

function truncate(str: string, max: number) {
  const s = str.replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) {
    return { title: "404 · 零号站台" };
  }
  const plain = truncate(stripMarkdown(article.content || ""), 160);
  const title = `${article.title} · 零号站台`;
  return {
    title,
    description: plain,
    alternates: { canonical: `https://www.121338.xyz/article/${id}` },
    openGraph: {
      title,
      description: plain,
      url: `https://www.121338.xyz/article/${id}`,
      siteName: "零号站台 · Platform Zero",
      locale: "zh_CN",
      type: "article",
      publishedTime: article.created_at,
    },
    twitter: {
      card: "summary",
      title,
      description: plain,
    },
  };
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
            <MarkdownContent content={article.content} className="prose-station" />
          ) : (
            <p style={{ color: "var(--fg-muted)" }}>暂无内容</p>
          )}
        </div>
      </article>

      {/* ── 评论区（客户端组件） ── */}
      <CommentsSection articleId={id} />
    </div>
  );
}
