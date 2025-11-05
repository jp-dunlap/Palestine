export const ARABIC_RE = /[\u0600-\u06FF]/g

export const arabicCoverage = (value: string) => {
  if (!value) return 0
  const matches = value.match(ARABIC_RE)
  const count = matches ? matches.length : 0
  return count / value.length
}

export const hasEnoughArabic = (value: string, threshold = 0.15) => arabicCoverage(value) >= threshold
