const ASCII_DIACRITICS = /[\u0300-\u036f]/g
const NUMERIC_PREFIX = /^(\d{3})-/
const AR_SUFFIX = /\.ar$/

export const slugify = (value: string) => {
  return value
    .normalize('NFD')
    .replace(ASCII_DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const sanitizeFilename = (value: string) => {
  return value.replace(/[^a-zA-Z0-9._-]/g, '')
}

export const hasNumericPrefix = (value: string) => NUMERIC_PREFIX.test(value)

export const extractNumericPrefix = (value: string) => {
  const match = value.match(NUMERIC_PREFIX)
  if (!match) {
    return null
  }
  const numeric = Number.parseInt(match[1] ?? '', 10)
  return Number.isNaN(numeric) ? null : numeric
}

export const stripNumericPrefix = (value: string) => value.replace(NUMERIC_PREFIX, '')

export const isArabicSlug = (value: string) => AR_SUFFIX.test(value)

export const ensureArabicSuffix = (value: string) => (isArabicSlug(value) ? value : `${value}.ar`)

export const stripArabicSuffix = (value: string) => value.replace(AR_SUFFIX, '')
