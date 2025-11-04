'use client'

import { useRef, useState } from 'react'

type Props = {
  onUploaded: (url: string) => void
  onError: (message: string) => void
  csrfToken: string | null
}

const ImageUploader = ({ onUploaded, onError, csrfToken }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = async () => {
    const input = inputRef.current
    if (!input || !input.files || input.files.length === 0) {
      return
    }
    const file = input.files[0]
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    try {
      const init: RequestInit = {
        method: 'POST',
        body: formData,
      }
      if (csrfToken) {
        init.headers = { 'x-csrf-token': csrfToken }
      }
      const response = await fetch('/api/admin/upload', init)
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error.error ?? 'Upload failed')
      }
      const json = await response.json()
      if (json.url) {
        onUploaded(json.url)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      onError((error as Error).message)
    } finally {
      input.value = ''
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-black hover:text-black"
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
      </label>
    </div>
  )
}

export default ImageUploader
