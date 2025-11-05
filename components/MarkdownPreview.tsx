'use client'

import { useMemo } from 'react'
import { extractMdxPlaceholders, markdownToHtml } from './markdown-utils'

type Props = {
  value: string
}

const MarkdownPreview = ({ value }: Props) => {
  const { sanitized, placeholders } = useMemo(() => extractMdxPlaceholders(value), [value])
  const html = useMemo(() => markdownToHtml(sanitized, placeholders), [sanitized, placeholders])

  return (
    <div className="min-h-[18rem] overflow-y-auto rounded border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-800">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

export default MarkdownPreview
