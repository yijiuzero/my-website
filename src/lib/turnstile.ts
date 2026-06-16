/**
 * Turnstile 服务端验证。
 * https://developers.cloudflare.com/turnstile/
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // 未配置 secret key 时跳过验证（本地开发等场景）
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY 未配置，跳过人机验证");
    return true;
  }
  // 客户端未启用 Turnstile 时传入的占位 token，直接拒绝
  if (token === "__turnstile_disabled__") return false;
  if (!token) return false;

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    }
  );

  const data = await res.json();
  return data.success === true;
}
