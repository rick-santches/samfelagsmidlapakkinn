const SPECIAL: Record<string, string> = {
  'ai-tools': 'AI tools',
  crm: 'CRM',
  hr: 'HR',
}

/** 'video-conferencing' → 'Video conferencing', 'ai-tools' → 'AI tools'. */
export function categoryLabel(category: string): string {
  const special = SPECIAL[category]
  if (special) return special
  const words = category.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
