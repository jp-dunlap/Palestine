import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'
import { requireCsrfToken } from '@/lib/api/csrf'
import { getOctokitForRequest, putFile, resolveCommitAuthor } from '@/lib/github'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeFilename } from '@/lib/slugs'

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

const MAX_SIZE = 5 * 1024 * 1024

const ipKey = (req: NextRequest) => {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]
  }
  return req.ip ?? 'unknown'
}

export const POST = async (req: NextRequest) => {
  const auth = ensureAuth(req)
  if (!auth.ok) {
    return auth.response
  }
  if (auth.mode === 'token') {
    const csrf = requireCsrfToken(req)
    if (csrf) {
      return csrf
    }
  }
  const limited = rateLimit(`upload:${ipKey(req)}`, 5, 60_000)
  if (!limited.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const form = await req.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }
  const file = form.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }
  const originalName = sanitizeFilename(file.name ?? 'upload')
  const baseName = originalName.length > 0 ? originalName : 'upload'
  const timestamp = Date.now()
  const filename = `${timestamp}-${baseName}`
  const storagePath = `public/images/uploads/${filename}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const client = getOctokitForRequest(req)
  const author = resolveCommitAuthor(auth.mode === 'oauth' ? auth.session : undefined)
  const message = `[CMS] Upload image ${filename}`
  try {
    await putFile(client, storagePath, buffer, message, undefined, undefined, author)
    return NextResponse.json({ url: `/images/uploads/${filename}` })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
