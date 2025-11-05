import { describe, expect, it } from 'vitest'
import { extractMdxPlaceholders, markdownToHtml } from '@/components/markdown-utils'

describe('markdown-utils', () => {
  it('preserves nested list structure when rendering markdown to HTML', () => {
    const markdown = `- parent\n  - child\n    - grandchild\n- sibling`
    const { sanitized, placeholders } = extractMdxPlaceholders(markdown)
    const html = markdownToHtml(sanitized, placeholders)
    const normalized = html.replace(/\s+/g, '')
    expect(normalized).toContain(
      '<ul><li>parent<ul><li>child<ul><li>grandchild</li></ul></li></ul></li><li>sibling</li></ul>',
    )
  })
})
