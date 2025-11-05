import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'

const TRANSLATE_URL = 'https://libretranslate.com/translate'

type TranslateBody = {
  text?: string
  source?: string
  target?: string
}

export const POST = async (req: NextRequest) => {
  const auth = ensureAuth(req)
  if (!auth.ok) {
    return auth.response
  }
  let payload: TranslateBody
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const text = typeof payload.text === 'string' ? payload.text : ''
  if (!text) {
    return NextResponse.json({ translated: '' })
  }
  const source = typeof payload.source === 'string' && payload.source ? payload.source : 'en'
  const target = typeof payload.target === 'string' && payload.target ? payload.target : 'ar'
  try {
    const response = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' }),
    })
    if (!response.ok) {
      throw new Error('Translation provider error')
    }
    const result = await response.json()
    const translated =
      typeof result.translatedText === 'string'
        ? result.translatedText
        : typeof result.translated === 'string'
          ? result.translated
          : text
    return NextResponse.json({ translated })
  } catch (error) {
    console.error('Translation fallback', error)
    return NextResponse.json({ translated: text })
  }
}
