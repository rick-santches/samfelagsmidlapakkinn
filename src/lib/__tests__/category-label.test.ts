import { describe, expect, it } from 'vitest'
import { categoryLabel, categoryNoun } from '../category-label'

describe('categoryLabel', () => {
  it('special-cases acronyms', () => {
    expect(categoryLabel('ai-tools')).toBe('AI tools')
    expect(categoryLabel('crm')).toBe('CRM')
    expect(categoryLabel('hr')).toBe('HR')
  })
  it('title-cases the rest', () => {
    expect(categoryLabel('video-conferencing')).toBe('Video conferencing')
  })
})

describe('categoryNoun (for "two ___ doing one job")', () => {
  it('never doubles the word "tools"', () => {
    // ai-tools would naively become "AI tools tools" — the bug this guards
    expect(categoryNoun('ai-tools')).toBe('AI tools')
  })
  it('reads as a natural noun phrase', () => {
    expect(categoryNoun('video-conferencing')).toBe('video-conferencing tools')
    expect(categoryNoun('crm')).toBe('CRM tools')
    expect(categoryNoun('project-mgmt')).toBe('project-management tools')
  })
  it('falls back gracefully for unknown/null', () => {
    expect(categoryNoun(null)).toBe('overlapping tools')
    expect(categoryNoun('mystery')).toBe('overlapping tools')
  })
})
