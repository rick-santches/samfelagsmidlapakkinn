import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zombly.vercel.app'
  return [
    { url: appUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/signin`, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
