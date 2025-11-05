import { hasEnoughArabic } from './arabic'

type Provider = {
  url: string
  requiresKey?: boolean
}

const DEFAULT_PROVIDERS: Provider[] = [
  { url: 'https://libretranslate.com/translate', requiresKey: true },
  { url: 'https://lt.blitzw.in/translate' },
  { url: 'https://translate.flossboxin.org.in/translate' },
]

const buildProviderList = () => {
  const providers: Provider[] = []
  const customUrl = process.env.CMS_TRANSLATE_URL?.trim()
  if (customUrl) {
    providers.push({ url: customUrl })
  }
  providers.push(...DEFAULT_PROVIDERS)
  return providers
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const DEFAULT_TIMEOUT_MS = 15_000

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

const buildEndpointVariants = (url: string) => {
  const variants = [url]
  try {
    const parsed = new URL(url)
    if (!parsed.pathname.endsWith('/translate')) {
      return variants
    }
    const normalize = (path: string) => {
      const next = new URL(url)
      next.pathname = path
      return next.toString()
    }
    variants.push(normalize('/api/translate'))
    variants.push(normalize('/v1/translate'))
  } catch {
    // ignore URL parse issues and fall back to original URL only
  }
  return variants
}

const buildPayload = (input: string, source: string, target: string, apiKey?: string) => {
  const payload: Record<string, string> = {
    q: input,
    source,
    target,
    format: 'text',
  }
  if (apiKey) {
    payload.api_key = apiKey
  }
  return payload
}

const encodeBody = (payload: Record<string, string>, mode: 'json' | 'form') => {
  if (mode === 'json') {
    return JSON.stringify(payload)
  }
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(payload)) {
    params.append(key, value)
  }
  return params.toString()
}

const extractTranslation = async (response: Response) => {
  const json = await response.json().catch(() => ({} as Record<string, unknown>))
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
  const parts = text.split(/(\n{2,})/)
  const output: string[] = []
  for (let index = 0; index < parts.length; index += 1) {
    const segment = parts[index]
    if (index % 2 === 1) {
      output.push(segment)
      continue
    }
    if (!segment.trim()) {
      output.push(segment)
      continue
    }
    const translated = await callProvider(segment, source, target)
    output.push(translated)
  }
  return output.join('')
}

export const callProvider = async (input: string, source: string, target: string) => {
  const providers = buildProviderList()
  const apiKey = process.env.CMS_TRANSLATE_API_KEY?.trim()
  const payload = buildPayload(input, source, target, apiKey)
  const errors: string[] = []

  for (const provider of providers) {
    if (provider.requiresKey && !apiKey) {
      continue
    }

    const endpoints = buildEndpointVariants(provider.url)

    for (const endpoint of endpoints) {
      let shouldRetryWithForm = false
      let advanceEndpoint = false

      for (const mode of ['json', 'form'] as const) {
        if (mode === 'form' && !shouldRetryWithForm) {
          continue
        }
        try {
          const response = await fetchWithTimeout(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type':
                mode === 'json' ? 'application/json' : 'application/x-www-form-urlencoded',
            },
            body: encodeBody(payload, mode),
          })

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              if (!apiKey && provider.requiresKey) {
                errors.push(`${endpoint} requires an API key`)
                shouldRetryWithForm = false
                advanceEndpoint = true
                break
              }

              if (mode === 'json') {
                shouldRetryWithForm = true
                errors.push(`${endpoint} responded with ${response.status}`)
                continue
              }

              errors.push(`${endpoint} responded with ${response.status}`)
              advanceEndpoint = true
              break
            }

            if (response.status === 404) {
              errors.push(`${endpoint} responded with ${response.status}`)
              advanceEndpoint = true
              break
            }

            if (mode === 'json' && [406, 415].includes(response.status)) {
              shouldRetryWithForm = true
              errors.push(`${endpoint} responded with ${response.status}`)
              continue
            }

            errors.push(`${endpoint} responded with ${response.status}`)
            advanceEndpoint = true
            break
          }

          return await extractTranslation(response)
        } catch (error) {
          errors.push(`${endpoint} failed: ${(error as Error).message}`)
          advanceEndpoint = true
          break
        }
      }

      if (advanceEndpoint) {
        continue
      }
      break
    }

    await delay(100 + Math.floor(Math.random() * 200))
  }

  throw new Error(`All translation providers failed${errors.length ? `: ${errors.join('; ')}` : ''}`)
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
