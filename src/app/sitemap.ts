import type { MetadataRoute } from "next";

const SITE_URL = "https://www.121338.xyz";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/articles`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return staticPages;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=id,created_at&published=eq.true&order=created_at.desc&limit=500`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 3600, tags: ["sitemap"] },
      }
    );
    if (!res.ok) return staticPages;
    const articles: { id: string; created_at: string }[] = await res.json();

    const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${SITE_URL}/article/${a.id}`,
      lastModified: new Date(a.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
