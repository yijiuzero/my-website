import Link from "next/link";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SUPABASE_ANON_KEY || "",
  Authorization: `Bearer ${SUPABASE_ANON_KEY || ""}`,
  "Content-Type": "application/json",
};

async function getArticles() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=*&published=eq.true&order=created_at.desc`,
      { headers, next: { revalidate: 60 } }
    );
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

async function getLinks() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/links?select=*&order=sort_order.asc`,
      { headers, next: { revalidate: 60 } }
    );
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const articles = await getArticles();
  const links = await getLinks();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* 文章列表 */}
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6">📝 最新文章</h2>

        {articles.length === 0 && (
          <div className="text-zinc-500 text-center py-20 bg-white rounded-xl border border-zinc-200">
            <p className="text-lg mb-2">还没有文章</p>
            <p className="text-sm">去 Supabase 的 Table Editor 里添加第一篇文章吧！</p>
          </div>
        )}

        <div className="space-y-4">
          {articles.map((article: any) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="block bg-white rounded-xl border border-zinc-200 p-6 hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                {article.title}
              </h3>
              {article.content && (
                <p className="text-zinc-500 text-sm line-clamp-2">
                  {article.content.slice(0, 200)}
                </p>
              )}
              <time className="text-xs text-zinc-400 mt-3 block">
                {new Date(article.created_at).toLocaleDateString("zh-CN")}
              </time>
            </Link>
          ))}
        </div>
      </div>

      {/* 侧边栏 - 友情链接 */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="sticky top-20">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">🔗 友情链接</h3>

          {links.length === 0 ? (
            <p className="text-zinc-400 text-sm">暂无链接</p>
          ) : (
            <ul className="space-y-2">
              {links.map((link: any) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-sm text-zinc-800">{link.name}</div>
                    {link.description && (
                      <div className="text-xs text-zinc-400 mt-0.5">{link.description}</div>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 p-4 bg-white rounded-xl border border-zinc-200">
            <h4 className="font-semibold text-sm text-zinc-700 mb-2">💡 添加数据</h4>
            <p className="text-xs text-zinc-500">
              去{" "}
              <a
                href={`${SUPABASE_URL}`}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Supabase
              </a>{" "}
              的 Table Editor 中添加文章和链接
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
