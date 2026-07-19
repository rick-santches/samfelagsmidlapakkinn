import { KNOWN_CANCELLATIONS, type CancellationInfo } from './cancellation'
import { categoryLabel } from './category-label'
import { MERCHANT_DICTIONARY } from './engine/merchants'

/**
 * Public "How to cancel X" guides, generated from the same cancellation
 * dictionary the Kill List uses. One page per known merchant — this is
 * the programmatic-SEO surface that brings search traffic.
 */
export interface Guide extends CancellationInfo {
  merchant: string
  slug: string
  domain: string | null
  categoryName: string | null
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const dictionaryByName = new Map(MERCHANT_DICTIONARY.map((m) => [m.name, m]))

export const GUIDES: Guide[] = Object.entries(KNOWN_CANCELLATIONS)
  .map(([merchant, info]) => {
    const entry = dictionaryByName.get(merchant)
    return {
      merchant,
      slug: slugify(merchant),
      domain: entry?.domain ?? null,
      categoryName: entry ? categoryLabel(entry.category) : null,
      ...info,
    }
  })
  .sort((a, b) => a.merchant.localeCompare(b.merchant))

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export function relatedGuides(guide: Guide, count = 4): Guide[] {
  const sameCategory = GUIDES.filter(
    (g) => g.slug !== guide.slug && g.categoryName === guide.categoryName,
  )
  const others = GUIDES.filter(
    (g) => g.slug !== guide.slug && g.categoryName !== guide.categoryName,
  )
  return [...sameCategory, ...others].slice(0, count)
}

export const DIFFICULTY_COPY: Record<CancellationInfo['difficulty'], { label: string; blurb: string }> = {
  easy: {
    label: 'Easy to cancel',
    blurb: 'A few clicks in the billing settings. No phone calls, no retention games.',
  },
  medium: {
    label: 'Medium difficulty',
    blurb: 'The cancel button exists, but it’s tucked away — follow the steps below and watch for auto-renew being switched back on.',
  },
  painful: {
    label: 'Painful to cancel',
    blurb: 'This vendor makes leaving hard: notice periods, termination fees, or retention calls. Read the steps carefully before your renewal date.',
  },
}
