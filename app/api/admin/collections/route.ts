import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'
import { collections } from '@/lib/collections'

export const GET = async (req: NextRequest) => {
  const auth = ensureAuth(req)
  if (!auth.ok) {
    return auth.response
  }
  const payload = collections.map((collection) => ({
    id: collection.id,
    label: collection.label,
    format: collection.format,
    defaultWorkflow: collection.defaultWorkflow,
    slugField: collection.slugField,
    fields: collection.fields,
  }))
  return NextResponse.json(payload)
}
