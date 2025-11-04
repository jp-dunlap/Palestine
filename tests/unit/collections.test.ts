import { describe, expect, it } from 'vitest'
import { collections, getCollection } from '@/lib/collections'

describe('collections schema', () => {
  it('includes expected collections', () => {
    const ids = collections.map((collection) => collection.id)
    expect(ids).toContain('chapters_en')
    expect(ids).toContain('chapters_ar')
    expect(ids).toContain('timeline')
    expect(ids).toContain('bibliography')
    expect(ids).toContain('gazetteer')
  })

  it('validates chapter frontmatter', () => {
    const collection = getCollection('chapters_en')
    expect(collection).toBeDefined()
    const result = collection!.schema.safeParse({
      title: 'Test Title',
      slug: 'test-slug',
      language: 'en',
      date: '2024-01-01',
      tags: ['history'],
      summary: 'Summary',
    })
    expect(result.success).toBe(true)
  })

  it('filters Arabic filenames correctly', () => {
    const english = getCollection('chapters_en')
    const arabic = getCollection('chapters_ar')
    expect(english?.filenameFilter?.('001-prologue.mdx')).toBe(true)
    expect(english?.filenameFilter?.('001-prologue.ar.mdx')).toBe(false)
    expect(arabic?.filenameFilter?.('001-prologue.ar.mdx')).toBe(true)
    expect(arabic?.filenameFilter?.('001-prologue.mdx')).toBe(false)
  })

  it('accepts timeline yaml structure', () => {
    const collection = getCollection('timeline')
    expect(collection).toBeDefined()
    const result = collection!.schema.safeParse({
      id: 'foundations',
      title: 'Foundations',
      start: -2000,
      end: null,
      places: ['Gaza'],
      sources: ['sayigh1997'],
      summary: 'Summary',
      tags: ['foundations'],
      certainty: 'medium',
    })
    expect(result.success).toBe(true)
  })
})
