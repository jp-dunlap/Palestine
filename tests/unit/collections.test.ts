import { describe, expect, it } from 'vitest'
import { collections, getCollection } from '@/lib/collections'

describe('collections schema', () => {
  it('includes expected collections', () => {
    const ids = collections.map((collection) => collection.id)
    expect(ids).toContain('chapters_en')
    expect(ids).toContain('timeline_data')
  })

  it('validates chapter frontmatter', () => {
    const collection = getCollection('chapters_en')
    expect(collection).toBeDefined()
    const result = collection!.schema.safeParse({
      title: 'Test Title',
      slug: 'test-slug',
      date: '2024-01-01',
      tags: ['history'],
      summary: 'Summary',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid timeline data without slug', () => {
    const collection = getCollection('timeline_data')
    expect(collection).toBeDefined()
    const result = collection!.schema.safeParse({
      title: 'Entry',
      events: [{ id: '1', label: 'Event' }],
    })
    expect(result.success).toBe(false)
  })
})
