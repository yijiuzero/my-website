import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ error: "标题不能超过 200 字" }, { status: 400 });
    }

    // 从 Authorization header 获取 access_token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const accessToken = authHeader.slice(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // 用 access_token 获取用户信息
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

    // 用 service_role 写入文章（绕过 RLS）
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        title,
        content,
        category,
        author_id: userId,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return NextResponse.json({ error: "发布失败: " + err }, { status: 500 });
    }

    const [article] = await insertRes.json();
    return NextResponse.json({ id: article.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "服务器错误" }, { status: 500 });
  }
}
