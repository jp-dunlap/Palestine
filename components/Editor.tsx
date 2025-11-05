'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ImageUploader from './ImageUploader'
import type { CollectionSummary } from './CollectionSwitcher'
import RichMarkdown, { type RichMarkdownHandle } from './RichMarkdown'
import MarkdownPreview from './MarkdownPreview'

export type MarkdownEditorState = {
  format: 'markdown'
  frontmatter: Record<string, unknown>
  body: string
  path: string | null
}

export type StructuredEditorState = {
  format: 'json' | 'yaml'
  text: string
  path: string | null
}

export type EditorState = MarkdownEditorState | StructuredEditorState

type Props = {
  collection: CollectionSummary | null
  state: EditorState | null
  onChange: (state: EditorState) => void
  onSave: (options?: { autosave?: boolean }) => void
  onDelete: () => void
  saving: boolean
  unsaved: boolean
  workflow: 'draft' | 'publish'
  onWorkflowChange: (workflow: 'draft' | 'publish') => void
  message: string
  onMessageChange: (value: string) => void
  onError: (message: string) => void
  csrfToken: string | null
  canTranslate?: boolean
  translating?: boolean
  onTranslate?: () => void
}

const fieldValue = (frontmatter: Record<string, unknown>, key: string) => {
  const value = frontmatter[key]
  return value === undefined ? '' : value
}

const Editor = ({
  collection,
  state,
  onChange,
  onSave,
  onDelete,
  saving,
  unsaved,
  workflow,
  onWorkflowChange,
  message,
  onMessageChange,
  onError,
  csrfToken,
  canTranslate = false,
  translating = false,
  onTranslate,
}: Props) => {
  const [bodyMode, setBodyMode] = useState<'rich' | 'raw'>('rich')
  const [showPreview, setShowPreview] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const autoSaveTimer = useRef<number | null>(null)
  const richEditorRef = useRef<RichMarkdownHandle | null>(null)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        onSave()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onSave])

  const frontmatterFields = useMemo(() => {
    if (!collection) return []
    return collection.fields.filter((field) => field.name !== 'body')
  }, [collection])

  useEffect(() => {
    if (state?.format !== 'markdown') {
      setBodyMode('rich')
      setShowPreview(false)
      setAutoSaveEnabled(false)
    }
  }, [state?.format])

  useEffect(() => {
    if (workflow !== 'draft' && autoSaveEnabled) {
      setAutoSaveEnabled(false)
    }
  }, [autoSaveEnabled, workflow])

  useEffect(() => {
    if (!autoSaveEnabled || !state || state.format !== 'markdown') {
      return
    }
    if (workflow !== 'draft' || !unsaved || saving) {
      return
    }
    if (autoSaveTimer.current) {
      window.clearTimeout(autoSaveTimer.current)
    }
    autoSaveTimer.current = window.setTimeout(() => {
      onSave({ autosave: true })
      autoSaveTimer.current = null
    }, 2500)
    return () => {
      if (autoSaveTimer.current) {
        window.clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = null
      }
    }
  }, [autoSaveEnabled, onSave, saving, state, unsaved, workflow])

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        window.clearTimeout(autoSaveTimer.current)
      }
    }
  }, [])

  const handleInsertImage = useCallback(
    (url: string) => {
      if (!state || state.format !== 'markdown') {
        return
      }
      if (bodyMode === 'rich') {
        richEditorRef.current?.insertImage(url)
        return
      }
      const alt = window.prompt('Image description (alt text)') ?? 'image'
      const safeAlt = alt.trim().replace(/\]/g, '\\]') || 'image'
      const prefix = state.body.trim().length > 0 ? '\n\n' : ''
      onChange({ ...state, body: `${state.body}${prefix}![${safeAlt}](${url})` })
    },
    [bodyMode, onChange, state],
  )

  if (!collection) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-500">Select a collection.</div>
  }

  if (!state) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-500">Select an entry to begin.</div>
  }

  const updateFrontmatter = (key: string, value: unknown) => {
    if (state.format !== 'markdown') {
      return
    }
    onChange({
      ...state,
      frontmatter: { ...state.frontmatter, [key]: value },
    })
  }

  const renderField = (field: { name: string; type: string; required?: boolean }) => {
    if (state.format !== 'markdown') {
      return null
    }
    const value = fieldValue(state.frontmatter, field.name)
    const label = field.name
    if (field.type === 'string') {
      return (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">
            {label}
            {field.required ? ' *' : ''}
          </span>
          <input
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => updateFrontmatter(field.name, event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </label>
      )
    }
    if (field.type === 'string[]') {
      const stringValue = Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : ''
      return (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">{label}</span>
          <input
            value={stringValue}
            onChange={(event) => updateFrontmatter(field.name, event.target.value.split(',').map((entry) => entry.trim()).filter(Boolean))}
            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            placeholder="comma separated"
          />
        </label>
      )
    }
    if (field.type === 'number[]') {
      const stringValue = Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : ''
      return (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">{label}</span>
          <input
            value={stringValue}
            onChange={(event) => {
              const numbers = event
                .target
                .value
                .split(',')
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0)
                .map((entry) => Number(entry))
                .filter((num) => !Number.isNaN(num))
              updateFrontmatter(field.name, numbers)
            }}
            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            placeholder="comma separated"
          />
        </label>
      )
    }
    if (field.type === 'boolean') {
      return (
        <label key={field.name} className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => updateFrontmatter(field.name, event.target.checked)}
          />
          {label}
        </label>
      )
    }
    return null
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Workflow</span>
          <select
            value={workflow}
            onChange={(event) => onWorkflowChange(event.target.value as 'draft' | 'publish')}
            className="rounded border border-zinc-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
          >
            <option value="draft">Draft (PR)</option>
            <option value="publish">Publish (commit)</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Commit message</span>
          <input
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            className="min-w-[220px] rounded border border-zinc-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
            placeholder="Optional"
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-600">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(event) => setAutoSaveEnabled(event.target.checked)}
            disabled={workflow !== 'draft'}
          />
          Auto-save drafts
        </label>
        {unsaved ? <span className="text-xs font-medium uppercase tracking-wide text-amber-600">Unsaved changes</span> : null}
      </div>

      <div className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
        <span className="font-medium text-zinc-700">Path:</span>{' '}
        {state.path ?? 'Not saved yet'}
      </div>

      {state.format === 'markdown' ? (
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="md:w-72 md:flex-shrink-0">
            <div className="flex flex-col gap-3">
              {frontmatterFields.length === 0 ? (
                <p className="text-sm text-zinc-500">No frontmatter fields configured.</p>
              ) : (
                frontmatterFields.map((field) => renderField(field))
              )}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                <span>Editor</span>
                <div className="inline-flex overflow-hidden rounded border border-zinc-300">
                  <button
                    type="button"
                    className={`px-3 py-1 ${bodyMode === 'rich' ? 'bg-black text-white' : 'bg-white text-zinc-700'}`}
                    onClick={() => setBodyMode('rich')}
                  >
                    Rich
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 border-l border-zinc-300 ${bodyMode === 'raw' ? 'bg-black text-white' : 'bg-white text-zinc-700'}`}
                    onClick={() => setBodyMode('raw')}
                  >
                    Raw
                  </button>
                </div>
                <button
                  type="button"
                  className={`rounded border px-2 py-1 ${
                    showPreview ? 'border-black bg-black text-white' : 'border-zinc-300 text-zinc-700'
                  }`}
                  onClick={() => setShowPreview((prev) => !prev)}
                >
                  {showPreview ? 'Hide preview' : 'Preview'}
                </button>
              </div>
              <ImageUploader csrfToken={csrfToken} onUploaded={handleInsertImage} onError={onError} />
            </div>
            <div className={`flex flex-col gap-4 ${showPreview ? 'md:flex-row' : ''}`}>
              <div className={showPreview ? 'md:w-1/2 space-y-2' : 'w-full space-y-2'}>
                <span className="text-sm font-medium text-zinc-700">Body</span>
                {bodyMode === 'rich' ? (
                  <RichMarkdown ref={richEditorRef} value={state.body} onChange={(body) => onChange({ ...state, body })} />
                ) : (
                  <textarea
                    value={state.body}
                    onChange={(event) => onChange({ ...state, body: event.target.value })}
                    className="h-72 w-full rounded border border-zinc-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none"
                  />
                )}
              </div>
              {showPreview ? (
                <div className="md:w-1/2 space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Preview</span>
                  <MarkdownPreview value={state.body} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">{state.format.toUpperCase()}</span>
          <textarea
            value={state.text}
            onChange={(event) => onChange({ ...state, text: event.target.value })}
            className="h-72 w-full rounded border border-zinc-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => onSave()}
          disabled={saving}
          className={`rounded border border-black px-4 py-2 text-sm font-medium transition ${
            saving ? 'bg-zinc-200 text-zinc-500' : 'text-black hover:bg-black hover:text-white'
          }`}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {canTranslate ? (
          <button
            type="button"
            onClick={onTranslate}
            disabled={translating}
            className={`rounded border border-emerald-600 px-4 py-2 text-sm font-medium transition ${
              translating ? 'bg-emerald-100 text-emerald-500' : 'text-emerald-700 hover:bg-emerald-600 hover:text-white'
            }`}
          >
            {translating ? 'Translating…' : 'Translate to Arabic'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDelete}
          className="rounded border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default Editor
