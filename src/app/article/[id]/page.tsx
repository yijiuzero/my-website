import Link from "next/link";
import { notFound } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SUPABASE_ANON_KEY || "",
  Authorization: `Bearer ${SUPABASE_ANON_KEY || ""}`,
  "Content-Type": "application/json",
};

async function getArticle(id: string) {
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

async function getComments(articleId: string) {
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 面包屑 */}
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors mb-6 inline-block"
      >
        ← 返回首页
      </Link>

      {/* 文章内容 */}
      <article className="bg-white rounded-xl border border-zinc-200 p-8 mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">{article.title}</h1>

        <time className="text-sm text-zinc-400 block mb-6">
          {new Date(article.created_at).toLocaleDateString("zh-CN")}
        </time>

        <div className="prose prose-zinc max-w-none whitespace-pre-wrap leading-relaxed text-zinc-700">
          {article.content || "（暂无内容）"}
        </div>
      </article>

      {/* 评论区 */}
      <div className="bg-white rounded-xl border border-zinc-200 p-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">
          💬 评论 ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <p className="text-zinc-400 text-sm">暂无评论，来说点什么吧</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <div
                key={comment.id}
                className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0"
              >
                <p className="text-zinc-700 leading-relaxed">{comment.content}</p>
                <time className="text-xs text-zinc-400 mt-2 block">
                  {new Date(comment.created_at).toLocaleDateString("zh-CN")}
                </time>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}