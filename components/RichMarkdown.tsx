'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import type { PlaceholderMap } from './markdown-utils'
import {
  extractMdxPlaceholders,
  htmlToMarkdown,
  markdownToHtml,
  restoreMdxPlaceholders,
} from './markdown-utils'

export type RichMarkdownHandle = {
  insertImage: (url: string) => void
}

type Props = {
  value: string
  onChange: (value: string) => void
}

const focusEditor = (element: HTMLDivElement | null) => {
  if (!element) return
  const selection = window.getSelection()
  if (selection && selection.rangeCount === 0) {
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  element.focus({ preventScroll: true })
}

const RichMarkdown = forwardRef<RichMarkdownHandle, Props>(({ value, onChange }, ref) => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const placeholdersRef = useRef<PlaceholderMap>(new Map())
  const markdownRef = useRef<string>(value)
  const pendingSyncRef = useRef<number | null>(null)
  const internalUpdateRef = useRef(false)

  const applyHtmlToEditor = useCallback((markdown: string) => {
    const element = editorRef.current
    if (!element) return
    const { sanitized, placeholders } = extractMdxPlaceholders(markdown)
    placeholdersRef.current = placeholders
    const html = markdownToHtml(sanitized, placeholders)
    if (element.innerHTML !== html) {
      element.innerHTML = html
    }
  }, [])

  useEffect(() => {
    if (internalUpdateRef.current && value === markdownRef.current) {
      internalUpdateRef.current = false
      return
    }
    markdownRef.current = value
    applyHtmlToEditor(value)
  }, [applyHtmlToEditor, value])

  const emitChange = useCallback(() => {
    const element = editorRef.current
    if (!element) return
    const html = element.innerHTML
    const markdown = htmlToMarkdown(html)
    const restored = restoreMdxPlaceholders(markdown, placeholdersRef.current)
    markdownRef.current = restored
    internalUpdateRef.current = true
    onChange(restored)
  }, [onChange])

  const scheduleSync = useCallback(() => {
    if (pendingSyncRef.current) {
      cancelAnimationFrame(pendingSyncRef.current)
    }
    pendingSyncRef.current = requestAnimationFrame(() => {
      pendingSyncRef.current = null
      emitChange()
    })
  }, [emitChange])

  useImperativeHandle(
    ref,
    () => ({
      insertImage: (url: string) => {
        const element = editorRef.current
        if (!element) return
        focusEditor(element)
        const alt = window.prompt('Image description (alt text)') ?? ''
        const safeAlt = alt
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
        document.execCommand('insertHTML', false, `<img src="${url}" alt="${safeAlt}" />`)
        scheduleSync()
      },
    }),
    [scheduleSync],
  )

  useEffect(() => {
    return () => {
      if (pendingSyncRef.current) {
        cancelAnimationFrame(pendingSyncRef.current)
      }
    }
  }, [])

  const runCommand = useCallback(
    (callback: () => void) => {
      const element = editorRef.current
      if (!element) return
      focusEditor(element)
      callback()
      scheduleSync()
    },
    [scheduleSync],
  )

  const applyFormatBlock = (tag: string) => {
    runCommand(() => {
      document.execCommand('formatBlock', false, tag.toUpperCase())
    })
  }

  const applyInline = (command: string) => {
    runCommand(() => {
      document.execCommand(command)
    })
  }

  const insertHtml = (html: string) => {
    runCommand(() => {
      document.execCommand('insertHTML', false, html)
    })
  }

  const getCurrentBlockInfo = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return null
    }
    const range = selection.getRangeAt(0)
    let container = range.startContainer as Node | null
    const root = editorRef.current
    while (container && container !== root) {
      if (container instanceof HTMLElement) {
        const display = window.getComputedStyle(container).display
        if (display === 'block' || display === 'list-item' || container.tagName === 'LI') {
          break
        }
      }
      container = container.parentNode
    }
    const block = (container as HTMLElement) || root
    if (!block) return null
    const prefixRange = range.cloneRange()
    prefixRange.setStart(block, 0)
    const text = prefixRange.toString()
    return { block, prefixRange, text }
  }

  const handleSpaceShortcut = () => {
    const info = getCurrentBlockInfo()
    if (!info) return false
    const raw = info.text.replace(/\u00a0/g, ' ')
    const trimmed = raw.trim()
    if (!trimmed) {
      return false
    }
    const selection = window.getSelection()
    if (!selection) return false
    const erase = () => {
      info.prefixRange.deleteContents()
    }
    switch (trimmed) {
      case '#':
        erase()
        applyFormatBlock('h1')
        return true
      case '##':
        erase()
        applyFormatBlock('h2')
        return true
      case '###':
        erase()
        applyFormatBlock('h3')
        return true
      case '>':
        erase()
        applyFormatBlock('blockquote')
        return true
      case '-':
      case '*':
      case '+':
        erase()
        runCommand(() => {
          document.execCommand('insertUnorderedList')
        })
        return true
      default: {
        if (/^\d+\.$/.test(trimmed)) {
          erase()
          runCommand(() => {
            document.execCommand('insertOrderedList')
          })
          return true
        }
      }
    }
    return false
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault()
      applyInline('bold')
      return
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault()
      applyInline('italic')
      return
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      const url = window.prompt('Link URL')
      if (url) {
        runCommand(() => {
          document.execCommand('createLink', false, url)
        })
      }
      return
    }
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      insertHtml('<br />')
      return
    }
    if (event.key === ' ' && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      const applied = handleSpaceShortcut()
      if (applied) {
        event.preventDefault()
      }
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    runCommand(() => {
      document.execCommand('insertText', false, text)
    })
  }

  const handleInput = () => {
    scheduleSync()
  }

  const handleBlur = () => {
    scheduleSync()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => applyFormatBlock('p')}
        >
          Paragraph
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => applyFormatBlock('h1')}
        >
          H1
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => applyFormatBlock('h2')}
        >
          H2
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => applyFormatBlock('h3')}
        >
          H3
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => applyInline('bold')}
        >
          Bold
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => applyInline('italic')}
        >
          Italic
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => insertHtml('<code>code</code>')}
        >
          Inline code
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => insertHtml('<pre><code></code></pre>')}
        >
          Code block
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() =>
            runCommand(() => {
              document.execCommand('insertUnorderedList')
            })
          }
        >
          Bullet list
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() =>
            runCommand(() => {
              document.execCommand('insertOrderedList')
            })
          }
        >
          Numbered list
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => applyFormatBlock('blockquote')}
        >
          Quote
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => insertHtml('<hr />')}
        >
          HR
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => {
            const url = window.prompt('Link URL')
            if (url) {
              runCommand(() => {
                document.execCommand('createLink', false, url)
              })
            }
          }}
        >
          Link
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-black hover:text-black"
          onClick={() => {
            const tableHtml =
              '<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>'
            insertHtml(tableHtml)
          }}
        >
          Table
        </button>
      </div>
      <div
        ref={editorRef}
        className="prose prose-sm max-w-none min-h-[18rem] rounded border border-zinc-300 bg-white px-3 py-2 text-sm focus-within:border-black focus-within:shadow-sm"
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={handleInput}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
})

RichMarkdown.displayName = 'RichMarkdown'

export default RichMarkdown
