import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  ensureAuth: vi.fn(() => ({ ok: true, mode: 'token', session: null })),
}))

vi.mock('@/lib/api/auth', () => authMock)

import { POST } from '@/app/api/admin/translate/route'

describe('POST /api/admin/translate', () => {
  const originalFetch = global.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    authMock.ensureAuth.mockReturnValue({ ok: true, mode: 'token', session: null })
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    global.fetch = originalFetch
    authMock.ensureAuth.mockClear()
    process.env = { ...originalEnv }
  })

  it('returns Arabic translation on success', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ translatedText: 'مرحبا بالعالم' }),
    })) as any

    const request = new NextRequest('http://localhost/api/admin/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello world', source: 'en', target: 'ar', mode: 'plain' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.translated).toBe('مرحبا بالعالم')
  })

  it('falls back to secondary provider when the first provider fails', async () => {
    const responses = [
      { ok: false, status: 404, json: async () => ({}) },
      { ok: false, status: 404, json: async () => ({}) },
      { ok: true, status: 200, json: async () => ({ translatedText: 'مرحبا بالعالم' }) },
    ]
    global.fetch = vi.fn(async () => {
      const next = responses.shift()
      if (!next) {
        throw new Error('No mock response available')
      }
      return next as any
    }) as any

    const request = new NextRequest('http://localhost/api/admin/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello world', source: 'en', target: 'ar', mode: 'plain' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.translated).toBe('مرحبا بالعالم')
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('skips providers that require an API key when none is configured', async () => {
    process.env.CMS_TRANSLATE_URL = 'https://custom.example/translate'
    const responses = [
      { ok: false, status: 401, json: async () => ({}) },
      { ok: true, status: 200, json: async () => ({ translatedText: 'مرحبا بالعالم' }) },
    ]
    global.fetch = vi.fn(async () => {
      const next = responses.shift()
      if (!next) {
        throw new Error('No mock response available')
      }
      return next as any
    }) as any

    const request = new NextRequest('http://localhost/api/admin/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello world', source: 'en', target: 'ar', mode: 'plain' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.translated).toBe('مرحبا بالعالم')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('returns 502 when translated text is not Arabic', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ translatedText: 'Hello world' }),
    })) as any

    const request = new NextRequest('http://localhost/api/admin/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello world', source: 'en', target: 'ar', mode: 'plain' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error).toBeDefined()
  })

  it('returns 502 when every provider fails', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({})
    })) as any

    const request = new NextRequest('http://localhost/api/admin/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello world', source: 'en', target: 'ar', mode: 'plain' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error).toMatch(/All translation providers failed/)
  })
})
