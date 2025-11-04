import { describe, expect, it } from 'vitest'
import { parseMarkdown, serializeMarkdown } from '@/lib/md'

describe('markdown serialization', () => {
  it('round trips frontmatter and body', () => {
    const original = `---\ntitle: Test\nslug: test\n---\n\nHello world\n`
    const parsed = parseMarkdown(original)
    expect(parsed.frontmatter.title).toBe('Test')
    expect(parsed.body.trim()).toBe('Hello world')
    const serialized = serializeMarkdown(parsed)
    expect(serialized).toContain('title: Test')
    expect(serialized).toContain('Hello world')
  })
})
