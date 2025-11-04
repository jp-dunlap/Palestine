import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'

export type MarkdownDocument<TFrontmatter extends Record<string, unknown>> = {
  frontmatter: TFrontmatter
  body: string
}

const remarkProcessor = unified().use(remarkParse)

export const parseMarkdown = <TFrontmatter extends Record<string, unknown>>(
  raw: string,
): MarkdownDocument<TFrontmatter> => {
  const parsed = matter(raw)
  return {
    frontmatter: parsed.data as TFrontmatter,
    body: parsed.content.trimEnd(),
  }
}

export const serializeMarkdown = <TFrontmatter extends Record<string, unknown>>({
  frontmatter,
  body,
}: MarkdownDocument<TFrontmatter>) => {
  remarkProcessor.parse(body ?? '')
  const formattedBody = `${(body ?? '').trim()}\n`
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== undefined) {
      cleaned[key] = value
    }
  }
  const serialized = matter.stringify(formattedBody, cleaned)
  return serialized.endsWith('\n') ? serialized : `${serialized}\n`
}
