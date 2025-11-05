'use client'

export type PlaceholderMap = Map<string, string>

const PLACEHOLDER_PATTERN = /<(Cite|Footnote)\b[\s\S]*?(?:\/>|<\/\1>)/g
export const PLACEHOLDER_KEY_PATTERN = /⟪MDX-\d+⟫/g

const placeholderToken = (index: number) => `@@MDX_PLACEHOLDER_${index}@@`

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const escapeAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

const summarizeMdxToken = (token: string) => {
  const summary = collapseWhitespace(token)
  if (summary.length <= 32) {
    return summary
  }
  return `${summary.slice(0, 29)}…`
}

const encodePlaceholders = (value: string) => {
  const keys: string[] = []
  const text = value.replace(PLACEHOLDER_KEY_PATTERN, (match) => {
    const index = keys.length
    keys.push(match)
    return placeholderToken(index)
  })
  return { text, keys }
}

const decodePlaceholders = (value: string, keys: string[], placeholders: PlaceholderMap) => {
  let result = value
  keys.forEach((key, index) => {
    const token = placeholders.get(key)
    const replacement = token
      ? `<span class="mdx-token inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800" data-mdx-token="${key}" contenteditable="false">${escapeHtml(
          summarizeMdxToken(token),
        )}</span>`
      : escapeHtml(key)
    result = result.split(placeholderToken(index)).join(replacement)
  })
  return result
}

const renderInline = (value: string, placeholders: PlaceholderMap) => {
  if (!value) return ''
  const { text, keys } = encodePlaceholders(value)
  let escaped = escapeHtml(text)
  escaped = escaped.replace(/!\[([^\]]*?)\]\(([^)]+)\)/g, (_, alt, url) => {
    return `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}" />`
  })
  escaped = escaped.replace(/\[([^\]]+?)\]\(([^)]+)\)/g, (_, label, url) => {
    return `<a href="${escapeAttribute(url)}">${label}</a>`
  })
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>')
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  escaped = escaped.replace(/__(.+?)__/g, '<strong>$1</strong>')
  escaped = escaped.replace(/\*(?!\*)([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
  escaped = escaped.replace(/_(?!_)([^_\n]+)_(?!_)/g, '<em>$1</em>')
  escaped = escaped.replace(/~~(.+?)~~/g, '<del>$1</del>')
  const restored = decodePlaceholders(escaped, keys, placeholders)
  return restored
}

const isUnorderedList = (line: string) => /^ {0,3}[-*+]\s+/.test(line)
const isOrderedList = (line: string) => /^ {0,3}\d+\.\s+/.test(line)
const isHeading = (line: string) => /^ {0,3}#{1,6}\s+/.test(line)
const isBlockquote = (line: string) => /^ {0,3}>\s?/.test(line)
const isCodeFence = (line: string) => /^ {0,3}```/.test(line)
const isHorizontalRule = (line: string) => /^ {0,3}(-{3,}|_{3,}|\*{3,})\s*$/.test(line)

const isTableStart = (lines: string[], index: number) => {
  if (index + 1 >= lines.length) return false
  const header = lines[index]
  const separator = lines[index + 1]
  if (!/^\s*\|/.test(header.trim())) return false
  if (!/^\s*\|?[-:| ]+\|?\s*$/.test(separator.trim())) return false
  return true
}

const splitTableRow = (line: string) => {
  const trimmed = line.trim()
  const withoutEdges = trimmed.replace(/^\|/, '').replace(/\|$/, '')
  if (!withoutEdges) return []
  return withoutEdges.split('|').map((cell) => cell.trim())
}

const renderMarkdownBlock = (markdown: string, placeholders: PlaceholderMap): string => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const parts: string[] = []
  let i = 0

  const consumeBlank = () => {
    while (i < lines.length && /^\s*$/.test(lines[i])) {
      i += 1
    }
  }

  while (i < lines.length) {
    if (/^\s*$/.test(lines[i])) {
      i += 1
      continue
    }

    if (isCodeFence(lines[i])) {
      const fence = lines[i]
      const lang = fence.replace(/`/g, '').trim()
      i += 1
      const codeLines: string[] = []
      while (i < lines.length && !isCodeFence(lines[i])) {
        codeLines.push(lines[i])
        i += 1
      }
      if (i < lines.length && isCodeFence(lines[i])) {
        i += 1
      }
      const escapedCode = escapeHtml(codeLines.join('\n'))
      const languageAttr = lang ? ` class="language-${escapeAttribute(lang)}"` : ''
      parts.push(`<pre><code${languageAttr}>${escapedCode}</code></pre>`)
      consumeBlank()
      continue
    }

    if (isHorizontalRule(lines[i])) {
      parts.push('<hr />')
      i += 1
      consumeBlank()
      continue
    }

    if (isHeading(lines[i])) {
      const match = lines[i].match(/^ {0,3}(#{1,6})\s+(.*)$/)
      if (match) {
        const depth = Math.min(match[1].length, 6)
        const content = match[2].trim()
        parts.push(`<h${depth}>${renderInline(content, placeholders)}</h${depth}>`)
      }
      i += 1
      consumeBlank()
      continue
    }

    if (isBlockquote(lines[i])) {
      const blockLines: string[] = []
      while (i < lines.length && isBlockquote(lines[i])) {
        blockLines.push(lines[i].replace(/^ {0,3}>\s?/, ''))
        i += 1
      }
      const inner = renderMarkdownBlock(blockLines.join('\n'), placeholders)
      parts.push(`<blockquote>${inner}</blockquote>`)
      consumeBlank()
      continue
    }

    if (isTableStart(lines, i)) {
      const header = splitTableRow(lines[i])
      const rows: string[][] = []
      i += 2
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(splitTableRow(lines[i]))
        i += 1
      }
      const headerHtml = header.length
        ? `<thead><tr>${header.map((cell) => `<th>${renderInline(cell, placeholders)}</th>`).join('')}</tr></thead>`
        : ''
      const bodyHtml = rows.length
        ? `<tbody>${rows
            .map((cells) => `<tr>${cells.map((cell) => `<td>${renderInline(cell, placeholders)}</td>`).join('')}</tr>`)
            .join('')}</tbody>`
        : '<tbody></tbody>'
      parts.push(`<table>${headerHtml}${bodyHtml}</table>`)
      consumeBlank()
      continue
    }

    if (isUnorderedList(lines[i]) || isOrderedList(lines[i])) {
      const ordered = isOrderedList(lines[i])
      const items: string[] = []
      const pattern = ordered ? /^ {0,3}\d+\.\s+/ : /^ {0,3}[-*+]\s+/
      while (i < lines.length && pattern.test(lines[i])) {
        const match = lines[i].match(pattern)
        if (!match) break
        const base = lines[i].slice(match[0].length)
        i += 1
        const continuation: string[] = []
        while (i < lines.length && /^ {2,}\S/.test(lines[i]) && !pattern.test(lines[i])) {
          continuation.push(lines[i].trim())
          i += 1
        }
        const text = [base, ...continuation].join(' ').trim()
        items.push(`<li>${renderInline(text, placeholders)}</li>`)
      }
      parts.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`)
      consumeBlank()
      continue
    }

    const paragraphLines: string[] = []
    while (i < lines.length) {
      const current = lines[i]
      if (/^\s*$/.test(current)) {
        break
      }
      if (
        isHeading(current) ||
        isBlockquote(current) ||
        isUnorderedList(current) ||
        isOrderedList(current) ||
        isCodeFence(current) ||
        isHorizontalRule(current) ||
        isTableStart(lines, i)
      ) {
        break
      }
      paragraphLines.push(current)
      i += 1
    }
    const paragraphText = paragraphLines.join(' ').trim()
    if (paragraphText) {
      parts.push(`<p>${renderInline(paragraphText, placeholders)}</p>`)
    }
    consumeBlank()
  }

  return parts.join('')
}

export const extractMdxPlaceholders = (
  markdown: string,
): { sanitized: string; placeholders: PlaceholderMap } => {
  const placeholders: PlaceholderMap = new Map()
  let index = 0
  const sanitized = markdown.replace(PLACEHOLDER_PATTERN, (match) => {
    const key = `⟪MDX-${index++}⟫`
    placeholders.set(key, match)
    return key
  })
  return { sanitized, placeholders }
}

export const restoreMdxPlaceholders = (markdown: string, placeholders: PlaceholderMap) => {
  let restored = markdown
  placeholders.forEach((token, key) => {
    restored = restored.split(key).join(token)
  })
  return restored
}

export const markdownToHtml = (markdown: string, placeholders: PlaceholderMap) => {
  try {
    return renderMarkdownBlock(markdown, placeholders)
  } catch {
    return `<p>${escapeHtml(markdown)}</p>`
  }
}

const escapeMarkdownText = (value: string) => {
  return value.replace(/([*_`])/g, '\\$1')
}

type SerializeContext = {
  listStack: { type: 'ul' | 'ol'; index: number }[]
  blockquoteDepth: number
}

const createContext = (): SerializeContext => ({ listStack: [], blockquoteDepth: 0 })

const repeat = (value: string, times: number) => new Array(times).fill(value).join('')

const normalizeTextContent = (value: string) => value.replace(/\u00a0/g, ' ')

const serializeInline = (node: ChildNode, context: SerializeContext): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMarkdownText(normalizeTextContent(node.textContent ?? ''))
  }
  if (!(node instanceof HTMLElement)) {
    return ''
  }
  if (node.dataset.mdxToken) {
    return node.dataset.mdxToken
  }
  const tag = node.tagName.toLowerCase()
  switch (tag) {
    case 'strong':
    case 'b':
      return `**${Array.from(node.childNodes).map((child) => serializeInline(child, context)).join('')}**`
    case 'em':
    case 'i':
      return `_${Array.from(node.childNodes).map((child) => serializeInline(child, context)).join('')}_`
    case 'code': {
      if (node.closest('pre')) {
        return Array.from(node.childNodes).map((child) => serializeInline(child, context)).join('')
      }
      const content = normalizeTextContent(node.textContent ?? '')
      return `\`${content.replace(/`/g, '\\`')}\``
    }
    case 'a': {
      const href = node.getAttribute('href') ?? '#'
      const inner = Array.from(node.childNodes).map((child) => serializeInline(child, context)).join('')
      return `[${inner}](${href})`
    }
    case 'span':
      return Array.from(node.childNodes).map((child) => serializeInline(child, context)).join('')
    case 'br':
      return '  \n'
    case 'img': {
      const src = node.getAttribute('src') ?? ''
      const alt = node.getAttribute('alt') ?? ''
      return `![${alt}](${src})`
    }
    default:
      return Array.from(node.childNodes).map((child) => serializeInline(child, context)).join('')
  }
}

const serializeBlock = (node: ChildNode, context: SerializeContext): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = normalizeTextContent(node.textContent ?? '')
    return text.trim() ? `${text}\n\n` : ''
  }
  if (!(node instanceof HTMLElement)) {
    return ''
  }
  if (node.dataset.mdxToken) {
    return `${node.dataset.mdxToken}\n\n`
  }
  const tag = node.tagName.toLowerCase()
  switch (tag) {
    case 'p': {
      const inner = Array.from(node.childNodes).map((child) => serializeInline(child, context)).join('')
      return inner ? `${inner}\n\n` : ''
    }
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const level = Number(tag.slice(1))
      const inner = Array.from(node.childNodes).map((child) => serializeInline(child, context)).join('')
      return `${'#'.repeat(level)} ${inner}\n\n`
    }
    case 'blockquote': {
      context.blockquoteDepth += 1
      const inner = Array.from(node.childNodes)
        .map((child) => serializeBlock(child, context))
        .join('')
        .split(/\n/)
        .map((line) => (line.trim() ? `${'> '.repeat(context.blockquoteDepth)}${line}` : line))
        .join('\n')
      context.blockquoteDepth -= 1
      return `${inner.trimEnd()}\n\n`
    }
    case 'pre': {
      const code = node.querySelector('code')
      const languageMatch = code?.className.match(/language-([\w-]+)/)
      const language = languageMatch ? languageMatch[1] : ''
      const content = code ? code.textContent ?? '' : node.textContent ?? ''
      const normalized = content.replace(/\n+$/, '')
      return `\`\`\`${language}\n${normalized}\n\`\`\`\n\n`
    }
    case 'ul': {
      context.listStack.push({ type: 'ul', index: 0 })
      const inner = Array.from(node.children)
        .map((child) => serializeBlock(child, context))
        .join('')
      context.listStack.pop()
      return inner
    }
    case 'ol': {
      context.listStack.push({ type: 'ol', index: 0 })
      const inner = Array.from(node.children)
        .map((child) => serializeBlock(child, context))
        .join('')
      context.listStack.pop()
      return inner
    }
    case 'li': {
      const current = context.listStack[context.listStack.length - 1]
      const indent = repeat('  ', context.listStack.length - 1)
      let marker = '-'
      if (current?.type === 'ol') {
        marker = `${current.index + 1}.`
        current.index += 1
      }
      const content = Array.from(node.childNodes)
        .map((child) => {
          if (child instanceof HTMLElement && (child.tagName.toLowerCase() === 'ul' || child.tagName.toLowerCase() === 'ol')) {
            return `\n${serializeBlock(child, context)}`
          }
          return serializeInline(child, context)
        })
        .join('')
      const normalized = content
        .split(/\n/)
        .map((line, index) => (index === 0 ? line : `${indent}  ${line}`))
        .join('\n')
      return `${indent}${marker} ${normalized}\n`
    }
    case 'table': {
      const headers: string[] = []
      const rows: string[][] = []
      const thead = node.querySelector('thead')
      const headerRow = thead?.querySelectorAll('tr')[0] ?? node.querySelector('tr')
      if (headerRow) {
        headerRow.querySelectorAll('th,td').forEach((cell) => {
          headers.push(normalizeTextContent(cell.textContent ?? '').trim())
        })
      }
      const bodyRows = node.querySelectorAll('tbody tr')
      const dataRows = bodyRows.length
        ? Array.from(bodyRows)
        : Array.from(node.querySelectorAll('tr')).slice(1)
      dataRows.forEach((row) => {
        const cells: string[] = []
        row.querySelectorAll('td').forEach((cell) => {
          cells.push(normalizeTextContent(cell.textContent ?? '').trim())
        })
        if (cells.length) {
          rows.push(cells)
        }
      })
      if (headers.length === 0 && rows.length === 0) {
        return ''
      }
      const headerLine = headers.length ? `| ${headers.map((cell) => cell.replace(/\|/g, '\\|')).join(' | ')} |` : ''
      const separator = headers.length ? `| ${headers.map(() => '---').join(' | ')} |` : ''
      const rowLines = rows.map((cells) => `| ${cells.map((cell) => cell.replace(/\|/g, '\\|')).join(' | ')} |`)
      return `${headerLine}\n${separator}\n${rowLines.join('\n')}\n\n`
    }
    case 'hr':
      return `---\n\n`
    case 'div':
      return Array.from(node.childNodes).map((child) => serializeBlock(child, context)).join('')
    default:
      return Array.from(node.childNodes).map((child) => serializeBlock(child, context)).join('')
  }
}

export const htmlToMarkdown = (html: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
  const context = createContext()
  const chunks = Array.from(doc.body.childNodes).map((child) => serializeBlock(child, context))
  const combined = chunks.join('').replace(/\n{3,}/g, '\n\n')
  return combined.trim()
}

