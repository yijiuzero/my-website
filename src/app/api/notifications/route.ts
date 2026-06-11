import { NextRequest, NextResponse } from "next/server";

// GET /api/notifications — 获取当前用户的通知
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const accessToken = authHeader.slice(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    // 查通知（带文章标题）
    const res = await fetch(
      `${supabaseUrl}/rest/v1/notifications?user_id=eq.${userId}&select=id,type,article_id,read,created_at,articles(title)&order=created_at.desc&limit=20`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      }
    );

    if (!res.ok) return NextResponse.json([], { status: 200 });

    const notifications = await res.json();
    return NextResponse.json(notifications, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

// PUT /api/notifications — 标记全部已读
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const accessToken = authHeader.slice(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    await fetch(
      `${supabaseUrl}/rest/v1/notifications?user_id=eq.${userId}&read=eq.false`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ read: true }),
      }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
