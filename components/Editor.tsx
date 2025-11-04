'use client'

import { useEffect, useMemo } from 'react'
import ImageUploader from './ImageUploader'
import type { CollectionSummary } from './CollectionSwitcher'

export type MarkdownEditorState = {
  format: 'markdown'
  frontmatter: Record<string, unknown>
  body: string
}

export type JsonEditorState = {
  format: 'json'
  json: string
}

export type EditorState = MarkdownEditorState | JsonEditorState

type Props = {
  collection: CollectionSummary | null
  state: EditorState | null
  onChange: (state: EditorState) => void
  onSave: () => void
  onDelete: () => void
  saving: boolean
  unsaved: boolean
  workflow: 'draft' | 'publish'
  onWorkflowChange: (workflow: 'draft' | 'publish') => void
  message: string
  onMessageChange: (value: string) => void
  onError: (message: string) => void
  csrfToken: string | null
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
}: Props) => {
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
        {unsaved ? <span className="text-xs font-medium uppercase tracking-wide text-amber-600">Unsaved changes</span> : null}
      </div>

      {state.format === 'markdown' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            {frontmatterFields.length === 0 ? (
              <p className="text-sm text-zinc-500">No frontmatter fields configured.</p>
            ) : (
              frontmatterFields.map((field) => renderField(field))
            )}
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">Body</span>
              <ImageUploader
                csrfToken={csrfToken}
                onUploaded={(url) =>
                  onChange({
                    ...state,
                    body: `${state.body}\n\n![image](${url})`,
                  })
                }
                onError={onError}
              />
            </div>
            <textarea
              value={state.body}
              onChange={(event) => onChange({ ...state, body: event.target.value })}
              className="h-64 w-full rounded border border-zinc-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">JSON</span>
          <textarea
            value={state.json}
            onChange={(event) => onChange({ ...state, json: event.target.value })}
            className="h-72 w-full rounded border border-zinc-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`rounded border border-black px-4 py-2 text-sm font-medium transition ${
            saving ? 'bg-zinc-200 text-zinc-500' : 'text-black hover:bg-black hover:text-white'
          }`}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
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
