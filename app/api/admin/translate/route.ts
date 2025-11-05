import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'
import { translateMdxPreserving, translatePlain } from '@/lib/translate'

type TranslateBody = {
  text?: string
  source?: string
  target?: string
  mode?: 'plain' | 'mdx'
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
  const mode = payload.mode === 'mdx' ? 'mdx' : 'plain'
  try {
    const translated = mode === 'mdx'
      ? await translateMdxPreserving(text, source, target)
      : await translatePlain(text, source, target)
    return NextResponse.json({ translated })
  } catch (error) {
    console.error('Translation error', error)
    const message = (error as Error).message || 'Translation failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
