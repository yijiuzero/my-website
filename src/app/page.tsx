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

interface LinkItem {
  id: string;
  name: string;
  url: string;
  description: string | null;
}

async function getArticles(): Promise<Article[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=*&published=eq.true&order=created_at.desc&limit=6`,
      { headers, next: { revalidate: 60, tags: ["articles"] } }
    );
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

async function getLinks(): Promise<LinkItem[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/links?select=*&order=sort_order.asc`,
      { headers, next: { revalidate: 60, tags: ["links"] } }
    );
    return res.ok ? res.json() : [];
  } catch {
    return [];
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

export default async function Home() {
  const articles = await getArticles();
  const links = await getLinks();

  return (
    <div className="max-w-4xl mx-auto px-5">
      {/* ── Hero ── */}
      <section className="py-20 md:py-28 text-center">
        <div className="animate-fade-up">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: "var(--fg)" }}
          >
            零号站台
          </h1>
          <p
            className="text-base md:text-lg mb-2 tracking-wide"
            style={{ color: "var(--fg-muted)" }}
          >
            Platform Zero
          </p>
          <p
            className="text-sm md:text-base max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--fg-secondary)" }}
          >
            慢一点，把东西放好。
            <br />
            这里是互联网上的一个小小落脚处，记录、分享、连接。
          </p>
        </div>

        <div
          className="flex items-center justify-center gap-3 mt-8 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <Link
            href="#sites"
            className="inline-block px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
            }}
          >
            我的站点
          </Link>
          <Link
            href="#articles"
            className="inline-block px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border site-card"
            style={{
              color: "var(--fg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            站台日志
          </Link>
        </div>
      </section>

      {/* ── 分隔线 ── */}
      <div
        className="w-16 h-px mx-auto mb-16"
        style={{ backgroundColor: "var(--border)" }}
      />

      {/* ── 我的站点 ── */}
      <section id="sites" className="mb-20">
        <div className="mb-8">
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--fg)" }}
          >
            我的站点
          </h2>
          <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
            站长搭建的小站
          </p>
        </div>

        {links.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
              站点建设中，敬请期待
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="site-card group block rounded-xl border p-5"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {link.name.charAt(0)}
                  </div>
                  <h3
                    className="font-medium text-sm group-hover:underline"
                    style={{ color: "var(--fg)" }}
                  >
                    {link.name}
                  </h3>
                  <svg
                    className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: "var(--fg-muted)" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
                {link.description && (
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {link.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ── 站台日志 ── */}
      <section id="articles" className="mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--fg)" }}
            >
              站台日志
            </h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
              停下来读点什么
            </p>
          </div>
          {articles.length > 0 && (
            <Link
              href="/articles"
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              查看全部 →
            </Link>
          )}
        </div>

        {articles.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
              还没有文章，稍后再来
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article, i) => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="card-interactive block rounded-xl border p-5 animate-fade-up"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                  animationDelay: `${i * 0.06}s`,
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
                <h3
                  className="font-medium mb-1.5 group-hover:underline"
                  style={{ color: "var(--fg)" }}
                >
                  {article.title}
                </h3>
                {article.content && (
                  <p
                    className="text-sm line-clamp-2 leading-relaxed"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {stripMarkdown(article.content)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 底部留白 ── */}
      <div className="h-8" />
    </div>
  );
}
