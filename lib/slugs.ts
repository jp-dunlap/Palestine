const ASCII_DIACRITICS = /[\u0300-\u036f]/g

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
