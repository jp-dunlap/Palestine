import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  ensureAuth: vi.fn(() => ({ ok: true, mode: 'token', session: null })),
}))

vi.mock('@/lib/api/auth', () => authMock)

import { POST } from '@/app/api/admin/translate/route'

describe('POST /api/admin/translate', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    authMock.ensureAuth.mockReturnValue({ ok: true, mode: 'token', session: null })
  })

  afterEach(() => {
    global.fetch = originalFetch
    authMock.ensureAuth.mockClear()
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

  it('returns 502 when provider responds with an error', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Service unavailable' }),
    })) as any

    const request = new NextRequest('http://localhost/api/admin/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello world', source: 'en', target: 'ar', mode: 'plain' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error).toMatch(/Translation/)
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
})
