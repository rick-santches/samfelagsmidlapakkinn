import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zombly.vercel.app'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // App and API surfaces are private; search engines get the marketing pages.
      disallow: ['/dashboard', '/api/', '/welcome'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
