import { NextRequest, NextResponse } from "next/server";

// POST /api/articles/[id]/comments — 发表评论
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const { content, parent_id } = await request.json();

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
        ...(parent_id ? { parent_id } : {}),
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error("Comment insert failed:", err);
      return NextResponse.json({ error: "评论失败" }, { status: 500 });
    }

    const inserted = await insertRes.json();
    let comment: Record<string, unknown>;
    if (Array.isArray(inserted) && inserted.length > 0) {
      comment = inserted[0];
    } else if (inserted && inserted.id) {
      comment = inserted;
    } else {
      comment = { id: "unknown" };
    }

    // 如果是回复，给被回复者创建通知
    if (parent_id) {
      try {
        const parentRes = await fetch(
          `${supabaseUrl}/rest/v1/comments?id=eq.${parent_id}&select=author_id`,
          { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` } }
        );
        const [parentComment] = await parentRes.json();
        if (parentComment && parentComment.author_id !== userId) {
          await fetch(`${supabaseUrl}/rest/v1/notifications`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
            },
            body: JSON.stringify({
              user_id: parentComment.author_id,
              type: "reply",
              article_id: articleId,
            }),
          });
        }
      } catch {
        // 通知失败不影响评论
      }
    }
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
      `${supabaseUrl}/rest/v1/comments?article_id=eq.${articleId}&select=id,content,created_at,author_id,parent_id,users(username,avatar_url)&order=created_at.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json([], {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    const comments = await res.json();
    return NextResponse.json(comments, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (e: any) {
    return NextResponse.json([], { status: 200 });
  }
}
