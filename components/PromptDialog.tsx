'use client'

import { createPortal } from 'react-dom'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type PromptDialogProps = {
  open: boolean
  title: string
  description?: string
  placeholder?: string
  initialValue?: string
  confirmLabel?: string
  cancelLabel?: string
  type?: 'text' | 'url'
  autoFocus?: boolean
  onCancel: () => void
  onSubmit: (value: string) => void
}

const PromptDialog = ({
  open,
  title,
  description,
  placeholder,
  initialValue = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'text',
  autoFocus = true,
  onCancel,
  onSubmit,
}: PromptDialogProps) => {
  const [mounted, setMounted] = useState(false)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      setValue(initialValue)
    }
  }, [initialValue, open])

  useEffect(() => {
    if (!open) {
      return
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel, open])

  useEffect(() => {
    if (!open || !autoFocus) {
      return
    }
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
    return () => cancelAnimationFrame(frame)
  }, [autoFocus, open])

  const portalTarget = useMemo(() => {
    if (!mounted) return null
    return document.body
  }, [mounted])

  if (!open || !portalTarget) {
    return null
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(value)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-dialog-title"
        className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg"
      >
        <h2 id="prompt-dialog-title" className="text-sm font-semibold text-zinc-900">
          {title}
        </h2>
        {description ? <p className="mt-1 text-xs text-zinc-600">{description}</p> : null}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            type={type}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded border border-transparent px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-800"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              className="rounded bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-900"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    portalTarget,
  )
}

export default PromptDialog
