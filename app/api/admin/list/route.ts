import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'
import { getCollection } from '@/lib/collections'
import { listEntries } from '@/lib/content'
import { getOctokitForRequest } from '@/lib/octokit'

export const GET = async (req: NextRequest) => {
  const auth = ensureAuth(req)
  if (!auth.ok) {
    return auth.response
  }
  const url = new URL(req.url)
  const collectionId = url.searchParams.get('collection')
  if (!collectionId) {
    return NextResponse.json({ error: 'collection is required' }, { status: 400 })
  }
  const collection = getCollection(collectionId)
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
  }
  try {
    const client = getOctokitForRequest(req)
    const entries = await listEntries(client, collection)
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
