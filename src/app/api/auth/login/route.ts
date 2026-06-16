import { NextRequest, NextResponse } from "next/server";

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 });
    }

    // 调用 Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const tokenRes = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: data.error_description || data.msg || "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 查 users 表获取 username
    let profile = null;
    if (data.user?.id) {
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${data.user.id}&select=username,avatar_url`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${data.access_token}`,
          },
        }
      );
      const users = await profileRes.json();
      profile = users?.[0] || null;
    }

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email || email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "服务器错误" }, { status: 500 });
  }
}
