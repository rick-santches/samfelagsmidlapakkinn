import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteConfig.url}/pontun`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
