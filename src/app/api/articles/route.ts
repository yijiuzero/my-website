import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    const userData = await userRes.json();
    const userId = userData.id;

    // 用 service_role 写入文章
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        title,
        content,
        category,
        published: true,
        author_id: userId,
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("Article insert failed:", errText);
      return NextResponse.json({ error: "发布失败" }, { status: 500 });
    }

    // Supabase return=representation 返回数组或单个对象
    const inserted = await insertRes.json();
    let articleId: string;

    if (Array.isArray(inserted) && inserted.length > 0) {
      articleId = inserted[0].id;
    } else if (inserted && inserted.id) {
      articleId = inserted.id;
    } else {
      // 降级：根据 response header 里的 Location 获取 id
      const location = insertRes.headers.get("location");
      if (location) {
        console.log("Using Location header to extract id:", location);
        articleId = location.split("/").pop()!;
      } else {
        console.error("Could not determine article id. Response:", JSON.stringify(inserted));
        // 最后尝试：查最新文章
        const latestRes = await fetch(
          `${supabaseUrl}/rest/v1/articles?select=id&author_id=eq.${userId}&order=created_at.desc&limit=1`,
          {
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
            },
          }
        );
        const latest = await latestRes.json();
        if (latest && latest.length > 0) {
          articleId = latest[0].id;
        } else {
          return NextResponse.json({ error: "发布后无法获取文章ID" }, { status: 500 });
        }
      }
    }

    // 刷新首页、列表页缓存
    revalidateTag("articles", {});
    if (articleId) {
      revalidatePath(`/article/${articleId}`);
    }

    return NextResponse.json({ id: articleId }, { status: 201 });
  } catch (e: any) {
    console.error("Article create error:", e);
    return NextResponse.json({ error: e.message || "服务器错误" }, { status: 500 });
  }
}
