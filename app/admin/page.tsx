'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import YAML from 'yaml'
import CollectionSwitcher, { type CollectionSummary } from '@/components/CollectionSwitcher'
import EntryList, { type Entry } from '@/components/EntryList'
import Editor, { type EditorState, type MarkdownEditorState, type StructuredEditorState } from '@/components/Editor'
import { hasEnoughArabic } from '@/lib/arabic'

type Session = {
  name?: string
  email?: string
  login?: string
}

type Toast = {
  id: number
  type: 'success' | 'error'
  message: string
}

const fetchJSON = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error ?? 'Request failed')
  }
  return response.json() as Promise<T>
}

const addArabicSuffix = (value: string) => (value.endsWith('.ar') ? value : `${value}.ar`)

const AdminPage = () => {
  const [authMode, setAuthMode] = useState<'oauth' | 'token' | null>(null)
  const [requiresLogin, setRequiresLogin] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [search, setSearch] = useState('')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [workflow, setWorkflow] = useState<'draft' | 'publish'>('publish')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [unsaved, setUnsaved] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [translating, setTranslating] = useState(false)
  const slugRef = useRef<string | null>(null)

  const pushToast = (type: 'success' | 'error', messageText: string) => {
    const id = Date.now()
    setToasts((current) => [...current, { id, type, message: messageText }])
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4000)
  }

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/admin/me')
        if (response.status === 401) {
          setAuthMode('oauth')
          setRequiresLogin(true)
          setSession(null)
          setCsrfToken(null)
          return
        }
        if (!response.ok) {
          throw new Error('Unable to load session')
        }
        const data = await response.json()
        if (data.mode === 'token') {
          setAuthMode('token')
          setSession(null)
          setCsrfToken(typeof data.csrfToken === 'string' ? data.csrfToken : null)
          setRequiresLogin(false)
        } else {
          setAuthMode('oauth')
          setSession(data)
          setCsrfToken(null)
          setRequiresLogin(false)
        }
      } catch (error) {
        pushToast('error', (error as Error).message)
        setCsrfToken(null)
      }
    }
    loadSession()
  }, [])

  useEffect(() => {
    if (!authMode || requiresLogin) {
      return
    }
    const loadCollections = async () => {
      try {
        const data = await fetchJSON<CollectionSummary[]>('/api/admin/collections')
        setCollections(data)
        if (data.length > 0) {
          setSelectedCollection(data[0].id)
          setWorkflow(data[0].defaultWorkflow)
        }
      } catch (error) {
        pushToast('error', (error as Error).message)
      }
    }
    loadCollections()
  }, [authMode, requiresLogin])

  const loadEntries = async (collectionId: string) => {
    setLoadingEntries(true)
    try {
      const data = await fetchJSON<Entry[]>(`/api/admin/list?collection=${encodeURIComponent(collectionId)}`)
      setEntries(data)
    } catch (error) {
      pushToast('error', (error as Error).message)
      setEntries([])
    } finally {
      setLoadingEntries(false)
    }
  }

  useEffect(() => {
    if (!selectedCollection) {
      return
    }
    loadEntries(selectedCollection)
  }, [selectedCollection])

  const fetchEntry = async (slug: string, desiredWorkflow: 'draft' | 'publish') => {
    if (!selectedCollection) {
      return
    }
    try {
      const query = new URLSearchParams({
        collection: selectedCollection,
        slug,
        workflow: desiredWorkflow,
      })
      const data = await fetchJSON<{
        frontmatter?: Record<string, unknown>
        body?: string
        data?: unknown
        path?: string
      }>(`/api/admin/item?${query.toString()}`)
      const collection = collections.find((item) => item.id === selectedCollection)
      if (collection?.format === 'json' || collection?.format === 'yaml') {
        const textValue = collection.format === 'json'
          ? JSON.stringify(data.data ?? data.frontmatter ?? {}, null, 2)
          : YAML.stringify(data.data ?? data.frontmatter ?? {})
        const structuredState: StructuredEditorState = {
          format: collection.format,
          text: textValue,
          path: data.path ?? null,
        }
        setEditorState(structuredState)
      } else {
        const mdState: MarkdownEditorState = {
          format: 'markdown',
          frontmatter: data.frontmatter ?? {},
          body: data.body ?? '',
          path: data.path ?? null,
        }
        setEditorState(mdState)
      }
      setUnsaved(false)
      setIsNew(false)
      slugRef.current = slug
    } catch (error) {
      pushToast('error', (error as Error).message)
    }
  }

  const handleSelectEntry = (slug: string) => {
    if (unsaved && !window.confirm('Discard unsaved changes?')) {
      return
    }
    setSelectedSlug(slug)
    setWorkflow('publish')
    setMessage('')
    fetchEntry(slug, 'publish')
  }

  const handleCreate = () => {
    if (unsaved && !window.confirm('Discard unsaved changes?')) {
      return
    }
    const collection = collections.find((item) => item.id === selectedCollection)
    if (!collection) {
      return
    }
    setSelectedSlug(null)
    setIsNew(true)
    setWorkflow(collection.defaultWorkflow)
    setMessage('')
    slugRef.current = null
    if (collection.format === 'json' || collection.format === 'yaml') {
      const initialText = collection.format === 'json'
        ? JSON.stringify({ slug: '', title: '' }, null, 2)
        : `id: ""\ntitle: ""\n`
      setEditorState({
        format: collection.format,
        text: initialText,
        path: null,
      })
    } else {
      setEditorState({
        format: 'markdown',
        frontmatter: { title: '', [collection.slugField]: '' },
        body: '',
        path: null,
      })
    }
    setUnsaved(false)
  }

  const filteredEntries = useMemo(() => {
    if (!search) {
      return entries
    }
    const query = search.toLowerCase()
    return entries.filter((entry) =>
      entry.title.toLowerCase().includes(query) || entry.slug.toLowerCase().includes(query),
    )
  }, [entries, search])

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (unsaved) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [unsaved])

  const handleChangeState = (value: EditorState) => {
    setEditorState(value)
    setUnsaved(true)
  }

  const handleWorkflowChange = (nextWorkflow: 'draft' | 'publish') => {
    if (unsaved && !window.confirm('Changing workflow will discard unsaved changes. Continue?')) {
      return
    }
    setWorkflow(nextWorkflow)
    setMessage('')
    if (selectedSlug && !isNew) {
      fetchEntry(selectedSlug, nextWorkflow)
    }
  }

  const resolveSlug = (state: EditorState, collection: CollectionSummary) => {
    if (state.format === 'markdown') {
      const value = state.frontmatter[collection.slugField]
      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
      const title = state.frontmatter.title
      if (typeof title === 'string' && title.trim()) {
        return title.trim()
      }
    } else {
      try {
        const parsed = state.format === 'json' ? JSON.parse(state.text) : YAML.parse(state.text)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const slugField = (parsed as Record<string, unknown>)[collection.slugField]
          if (typeof slugField === 'string' && slugField.trim()) {
            return slugField.trim()
          }
          const title = (parsed as Record<string, unknown>).title
          if (typeof title === 'string' && title.trim()) {
            return title.trim()
          }
        }
      } catch {
        // ignore parsing errors and fall back to existing slug references
      }
    }
    return selectedSlug ?? slugRef.current ?? ''
  }

  const handleSave = async (options?: { autosave?: boolean }) => {
    if (!selectedCollection || !editorState) {
      return
    }
    const collection = collections.find((item) => item.id === selectedCollection)
    if (!collection) {
      return
    }
    let frontmatter: Record<string, unknown> | undefined
    let body: string | undefined
    let data: unknown
    if (editorState.format === 'markdown') {
      frontmatter = editorState.frontmatter
      body = editorState.body
    } else if (editorState.format === 'json') {
      try {
        data = JSON.parse(editorState.text)
      } catch {
        pushToast('error', 'Invalid JSON payload')
        return
      }
    } else {
      try {
        data = YAML.parse(editorState.text) ?? {}
      } catch {
        pushToast('error', 'Invalid YAML payload')
        return
      }
    }
    const slugValue = resolveSlug(editorState, collection)
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        collection: selectedCollection,
        slug: slugValue,
        workflow,
      }
      const trimmedMessage = message.trim()
      const commitMessage = options?.autosave
        ? trimmedMessage
          ? `${trimmedMessage} [autosave]`
          : 'Autosave changes [autosave]'
        : trimmedMessage
      payload.message = commitMessage
      payload.originalSlug = slugRef.current ?? selectedSlug ?? ''
      if (frontmatter) payload.frontmatter = frontmatter
      if (body !== undefined) payload.body = body
      if (data !== undefined) payload.data = data
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }
      const response = await fetch('/api/admin/save', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to save entry' }))
        throw new Error(error.error ?? 'Unable to save entry')
      }
      const json = await response.json()
      if (options?.autosave) {
        if (json.prUrl) {
          pushToast('success', 'Draft auto-saved')
        } else {
          pushToast('success', 'Changes auto-saved')
        }
      } else if (json.prUrl) {
        pushToast('success', `Draft updated: ${json.prUrl}`)
      } else {
        pushToast('success', 'Entry saved to main branch')
      }
      const nextSlug = typeof json.slug === 'string' && json.slug.length > 0
        ? json.slug
        : slugValue || slugRef.current
      if (nextSlug) {
        setSelectedSlug(nextSlug)
        slugRef.current = nextSlug
      }
      if (!options?.autosave) {
        setMessage('')
      }
      setUnsaved(false)
      setIsNew(false)
      await loadEntries(selectedCollection)
      if (nextSlug) {
        await fetchEntry(nextSlug, workflow)
      }
    } catch (error) {
      pushToast('error', (error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleTranslate = async () => {
    if (!editorState || editorState.format !== 'markdown') {
      return
    }
    const collection = collections.find((item) => item.id === selectedCollection)
    if (collection?.id !== 'chapters_en') {
      return
    }
    const englishSlug = selectedSlug ?? slugRef.current
    if (!englishSlug) {
      pushToast('error', 'Save the English chapter before translating.')
      return
    }
    const translationErrorMessage = 'Translation service unavailable; nothing was saved.'
    const validationErrorMessage = 'Arabic translation validation failed; nothing was saved.'

    const requestTranslation = async (text: string, mode: 'plain' | 'mdx') => {
      if (!text.trim()) {
        return text
      }
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source: 'en', target: 'ar', mode }),
      })
      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>
      if (!response.ok) {
        const message = typeof payload.error === 'string' ? (payload.error as string) : translationErrorMessage
        throw new Error(message)
      }
      const translated = typeof payload.translated === 'string'
        ? (payload.translated as string)
        : ''
      if (!translated.trim()) {
        throw new Error(validationErrorMessage)
      }
      return translated
    }

    const saveArabicDraft = async (frontmatter: Record<string, unknown>, body: string) => {
      const arabicSlug = addArabicSuffix(englishSlug)
      const payload: Record<string, unknown> = {
        collection: 'chapters_ar',
        slug: arabicSlug,
        originalSlug: arabicSlug,
        workflow: 'draft',
        frontmatter,
        body,
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }
      const response = await fetch('/api/admin/save', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to save Arabic translation' }))
        throw new Error(error.error ?? 'Unable to save Arabic translation')
      }
      return response.json()
    }

    const handleSaveSuccess = async (result: Record<string, unknown>, fallback = false) => {
      if (typeof result.prUrl === 'string' && result.prUrl) {
        pushToast('success', `Arabic draft ready: ${result.prUrl}`)
      } else {
        pushToast('success', fallback ? 'Arabic translation saved via server translation' : 'Arabic translation saved')
      }
      if (selectedCollection === 'chapters_ar') {
        await loadEntries('chapters_ar')
      }
    }

    setTranslating(true)
    try {
      const originalFrontmatter = editorState.frontmatter
      const originalTitle = typeof originalFrontmatter.title === 'string' ? originalFrontmatter.title : ''
      const originalSummary = typeof originalFrontmatter.summary === 'string'
        ? originalFrontmatter.summary
        : undefined
      const translatedTitle = originalTitle ? await requestTranslation(originalTitle, 'plain') : ''
      if (translatedTitle.trim() && !hasEnoughArabic(translatedTitle)) {
        throw new Error(validationErrorMessage)
      }
      const translatedSummary =
        originalSummary && originalSummary.trim()
          ? await requestTranslation(originalSummary, 'plain')
          : originalSummary
      if (translatedSummary && translatedSummary.trim() && !hasEnoughArabic(translatedSummary)) {
        throw new Error(validationErrorMessage)
      }
      const translatedBody = editorState.body.trim()
        ? await requestTranslation(editorState.body, 'mdx')
        : editorState.body
      if (translatedBody.trim() && !hasEnoughArabic(translatedBody)) {
        throw new Error(validationErrorMessage)
      }

      const translatedFrontmatter: Record<string, unknown> = {
        ...originalFrontmatter,
        title: translatedTitle,
        language: 'ar',
      }
      if (translatedSummary !== undefined) {
        translatedFrontmatter.summary = translatedSummary
      }

      const result = await saveArabicDraft(translatedFrontmatter, translatedBody)
      await handleSaveSuccess(result)
      return
    } catch (error) {
      console.warn('Client-side translation failed, falling back to server translation', error)
      const fallbackFrontmatter: Record<string, unknown> = {
        ...editorState.frontmatter,
        language: 'ar',
      }
      try {
        const result = await saveArabicDraft(fallbackFrontmatter, editorState.body)
        await handleSaveSuccess(result, true)
        return
      } catch (fallbackError) {
        const rawMessage = (fallbackError as Error).message
        const displayMessage = rawMessage && rawMessage !== 'Failed to fetch'
          ? rawMessage
          : translationErrorMessage
        pushToast('error', displayMessage)
      }
    } finally {
      setTranslating(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCollection) {
      return
    }
    const slug = selectedSlug ?? slugRef.current
    if (!slug) {
      pushToast('error', 'No entry selected')
      return
    }
    if (!window.confirm('Delete this entry? This cannot be undone.')) {
      return
    }
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }
      const response = await fetch('/api/admin/item', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          collection: selectedCollection,
          slug,
          workflow,
          message: message.trim(),
        }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to delete entry' }))
        throw new Error(error.error ?? 'Unable to delete entry')
      }
      const json = await response.json().catch(() => ({}))
      if (json.prUrl) {
        pushToast('success', `Deletion draft ready: ${json.prUrl}`)
      } else {
        pushToast('success', 'Entry removed')
      }
      setEditorState(null)
      setSelectedSlug(null)
      setUnsaved(false)
      setMessage('')
      slugRef.current = null
      await loadEntries(selectedCollection)
    } catch (error) {
      pushToast('error', (error as Error).message)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } finally {
      window.location.reload()
    }
  }

  const collection = collections.find((item) => item.id === selectedCollection) ?? null

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Palestine CMS Admin</h1>
            {session ? (
              <p className="text-xs text-zinc-500">
                Signed in as {session.name ?? session.login}
              </p>
            ) : authMode === 'token' ? (
              <p className="text-xs text-zinc-500">Token mode</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-sm">
            {authMode === 'oauth' && !requiresLogin ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:border-black hover:text-black"
              >
                Sign out
              </button>
            ) : null}
            {authMode === 'oauth' && requiresLogin ? (
              <a
                href="/api/auth/signin"
                className="rounded border border-black px-3 py-1.5 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                Sign in with GitHub
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 py-6">
        <aside className="w-56">
          <CollectionSwitcher
            collections={collections}
            selected={selectedCollection}
            onSelect={(id) => {
              if (unsaved && !window.confirm('Discard unsaved changes?')) {
                return
              }
              setSelectedCollection(id)
              const next = collections.find((item) => item.id === id)
              setWorkflow(next?.defaultWorkflow ?? 'publish')
              setSelectedSlug(null)
              setEditorState(null)
              setSearch('')
              setUnsaved(false)
              setIsNew(false)
            }}
          />
        </aside>
        <section className="flex w-72 flex-col">
          {loadingEntries ? (
            <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading entries…</div>
          ) : (
            <EntryList
              entries={filteredEntries}
              selected={selectedSlug}
              onSelect={handleSelectEntry}
              onCreate={handleCreate}
              search={search}
              onSearch={setSearch}
            />
          )}
        </section>
        <section className="flex flex-1 flex-col">
          <div className="flex-1 rounded border border-zinc-200 bg-white p-6 shadow-sm">
            <Editor
              collection={collection}
              state={editorState}
              onChange={handleChangeState}
              onSave={handleSave}
              onDelete={handleDelete}
              saving={saving}
              unsaved={unsaved}
              workflow={workflow}
              onWorkflowChange={handleWorkflowChange}
              message={message}
              onMessageChange={setMessage}
              onError={(text) => pushToast('error', text)}
              csrfToken={csrfToken}
              canTranslate={collection?.id === 'chapters_en' && editorState?.format === 'markdown'}
              translating={translating}
              onTranslate={handleTranslate}
            />
          </div>
        </section>
      </main>

      <div className="fixed right-6 top-6 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[220px] rounded border px-4 py-2 text-sm shadow ${
              toast.type === 'success'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-red-500 bg-red-50 text-red-700'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPage
