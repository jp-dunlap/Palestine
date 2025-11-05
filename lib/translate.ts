import { hasEnoughArabic } from './arabic'

const TRANSLATE_URL = 'https://libretranslate.com/translate'

type Segment = {
  text: string
  translate: boolean
}

const pushSegment = (segments: Segment[], text: string, translate: boolean) => {
  if (!text) return
  const last = segments.at(-1)
  if (last && last.translate === translate) {
    last.text += text
    return
  }
  segments.push({ text, translate })
}

const findMatching = (source: string, start: number, open: string, close: string) => {
  let depth = 0
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]
    if (char === open) {
      depth += 1
    } else if (char === close) {
      if (depth === 0) {
        return index
      }
      depth -= 1
    }
  }
  return -1
}

const segmentMdx = (mdx: string): Segment[] => {
  const segments: Segment[] = []
  let index = 0
  while (index < mdx.length) {
    if (mdx.startsWith('```', index)) {
      const closing = mdx.indexOf('```', index + 3)
      const end = closing === -1 ? mdx.length : closing + 3
      pushSegment(segments, mdx.slice(index, end), false)
      index = end
      continue
    }

    const char = mdx[index]

    if (char === '`') {
      const closing = mdx.indexOf('`', index + 1)
      const end = closing === -1 ? mdx.length : closing + 1
      pushSegment(segments, mdx.slice(index, end), false)
      index = end
      continue
    }

    if (char === '<') {
      const closing = mdx.indexOf('>', index + 1)
      if (closing === -1) {
        pushSegment(segments, mdx.slice(index), false)
        break
      }
      pushSegment(segments, mdx.slice(index, closing + 1), false)
      index = closing + 1
      continue
    }

    if (char === '[' || (char === '!' && mdx[index + 1] === '[')) {
      const isImage = char === '!'
      const bracketStart = isImage ? index + 1 : index
      const closeBracket = findMatching(mdx, bracketStart + 1, '[', ']')
      if (closeBracket === -1) {
        pushSegment(segments, mdx[index], true)
        index += 1
        continue
      }
      if (isImage) {
        pushSegment(segments, '![', false)
      } else {
        pushSegment(segments, '[', false)
      }
      const inner = mdx.slice(bracketStart + 1, closeBracket)
      pushSegment(segments, inner, true)
      pushSegment(segments, ']', false)
      index = closeBracket + 1
      if (mdx[index] === '(') {
        const closeParen = findMatching(mdx, index + 1, '(', ')')
        const end = closeParen === -1 ? mdx.length : closeParen + 1
        pushSegment(segments, mdx.slice(index, end), false)
        index = end
      }
      continue
    }

    pushSegment(segments, char, true)
    index += 1
  }
  return segments
}

const translateParagraphs = async (text: string, source: string, target: string) => {
  const chunks = text.split(/\n{2,}/)
  const output: string[] = []
  for (const chunk of chunks) {
    if (!chunk.trim()) {
      output.push(chunk)
      continue
    }
    const translated = await callProvider(chunk, source, target)
    output.push(translated)
  }
  return output.join('\n\n')
}

export const callProvider = async (input: string, source: string, target: string) => {
  const response = await fetch(TRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: input, source, target, format: 'text' }),
  })
  if (!response.ok) {
    throw new Error(`Translation provider error: ${response.status}`)
  }
  const json = await response.json()
  const output =
    typeof json.translatedText === 'string'
      ? json.translatedText
      : typeof json.translated === 'string'
        ? json.translated
        : ''
  if (!output) {
    throw new Error('Empty translation')
  }
  return output
}

export const translatePlain = async (text: string, source = 'en', target = 'ar') => {
  if (!text?.trim()) {
    return text
  }
  const translated = await translateParagraphs(text, source, target)
  if (!hasEnoughArabic(translated)) {
    throw new Error('Non-Arabic output')
  }
  return translated
}

export const translateMdxPreserving = async (mdx: string, source = 'en', target = 'ar') => {
  if (!mdx?.trim()) {
    return mdx
  }
  const segments = segmentMdx(mdx)
  for (const segment of segments) {
    if (!segment.translate) {
      continue
    }
    const translated = await translateParagraphs(segment.text, source, target)
    if (!hasEnoughArabic(translated) && segment.text.trim()) {
      throw new Error('Non-Arabic output')
    }
    segment.text = translated
  }
  const translatedPortion = segments
    .filter((segment) => segment.translate)
    .map((segment) => segment.text)
    .join('')
  if (translatedPortion.trim() && !hasEnoughArabic(translatedPortion)) {
    throw new Error('Non-Arabic output')
  }
  const output = segments.map((segment) => segment.text).join('')
  return output
}
