// lib/supabase.js
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
}

// 获取文章列表
export async function getArticles() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=*&published=eq.true&order=created_at.desc`, {
    headers
  })
  return res.json()
}

// 获取单篇文章
export async function getArticle(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}&select=*`, {
    headers
  })
  const data = await res.json()
  return data[0]
}

// 获取友情链接
export async function getLinks() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/links?select=*&order=sort_order.asc`, {
    headers
  })
  return res.json()
}
