import type { MetadataRoute } from 'next'
import { GUIDES } from '@/lib/guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zombly.vercel.app'
  return [
    { url: appUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/guides`, changeFrequency: 'weekly', priority: 0.8 },
    ...GUIDES.map((guide) => ({
      url: `${appUrl}/guides/how-to-cancel-${guide.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${appUrl}/signin`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${appUrl}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${appUrl}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
