import { NextRequest, NextResponse } from "next/server";

// POST /api/articles/[id]/comments — 发表评论
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "评论不能超过 2000 字" }, { status: 400 });
    }

    // 验证用户
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const accessToken = authHeader.slice(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // 获取用户信息
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!userRes.ok) {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }
    const { id: userId } = await userRes.json();

    // 用 service_role 写入评论
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        article_id: articleId,
        author_id: userId,
        content: content.trim(),
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return NextResponse.json({ error: "评论失败: " + err }, { status: 500 });
    }

    const [comment] = await insertRes.json();
    return NextResponse.json(comment, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "服务器错误" }, { status: 500 });
  }
}

// GET /api/articles/[id]/comments — 获取评论列表
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/comments?article_id=eq.${articleId}&select=id,content,created_at,author_id,users(username,avatar_url)&order=created_at.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const comments = await res.json();
    return NextResponse.json(comments);
  } catch (e: any) {
    return NextResponse.json([], { status: 200 });
  }
}
