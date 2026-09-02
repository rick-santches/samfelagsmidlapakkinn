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

// Sentence-friendly noun phrases for "you're paying for two ___ doing one job".
// Kept lowercase and de-duplicated so "ai-tools" doesn't become "AI tools tools".
const NOUN: Record<string, string> = {
  'video-conferencing': 'video-conferencing tools',
  storage: 'file-storage tools',
  design: 'design tools',
  'project-mgmt': 'project-management tools',
  crm: 'CRM tools',
  'email-marketing': 'email-marketing tools',
  accounting: 'accounting tools',
  'ai-tools': 'AI tools',
  hosting: 'hosting providers',
  monitoring: 'monitoring tools',
  hr: 'HR tools',
  security: 'security tools',
}

/** Phrase to slot into "two ___ doing one job". */
export function categoryNoun(category: string | null | undefined): string {
  return (category && NOUN[category]) || 'overlapping tools'
}
