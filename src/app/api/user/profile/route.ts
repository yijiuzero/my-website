import { NextRequest, NextResponse } from "next/server";

// PUT /api/user/profile — 修改用户名
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const accessToken = authHeader.slice(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 获取用户身份
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

    const { username } = await request.json();
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return NextResponse.json({ error: "用户名不能为空" }, { status: 400 });
    }
    const trimmed = username.trim();
    if (trimmed.length > 30) {
      return NextResponse.json({ error: "用户名最多 30 个字符" }, { status: 400 });
    }

    // 更新 users 表
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ username: trimmed }),
    });

    if (!updateRes.ok) {
      return NextResponse.json({ error: "修改失败，请稍后重试" }, { status: 500 });
    }

    const [updated] = await updateRes.json();
    return NextResponse.json({ username: updated?.username || trimmed });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
