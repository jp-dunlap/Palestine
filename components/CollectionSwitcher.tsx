'use client'

export type CollectionSummary = {
  id: string
  label: string
  format: 'markdown' | 'json' | 'yaml'
  defaultWorkflow: 'draft' | 'publish'
  slugField: string
  fields: { name: string; type: string; required?: boolean }[]
}

type Props = {
  collections: CollectionSummary[]
  selected: string | null
  onSelect: (id: string) => void
}

const CollectionSwitcher = ({ collections, selected, onSelect }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {collections.map((collection) => (
        <button
          key={collection.id}
          type="button"
          onClick={() => onSelect(collection.id)}
          className={`rounded border px-3 py-2 text-left text-sm transition ${
            selected === collection.id
              ? 'border-black bg-black text-white'
              : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-500'
          }`}
        >
          <span className="block font-medium">{collection.label}</span>
          <span className="block text-xs text-zinc-500">{collection.format.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}

export default CollectionSwitcher
