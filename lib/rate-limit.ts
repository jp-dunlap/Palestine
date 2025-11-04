type Entry = {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

export const rateLimit = (key: string, limit: number, windowMs: number) => {
  const now = Date.now()
  const existing = store.get(key)
  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }
  if (existing.count >= limit) {
    return { success: false, retryAfter: Math.max(0, existing.resetAt - now) }
  }
  existing.count += 1
  return { success: true }
}
