'use client'

type Entry = {
  slug: string
  title: string
  updatedAt: string | null
}

type Props = {
  entries: Entry[]
  selected: string | null
  onSelect: (slug: string) => void
  onCreate: () => void
  search: string
  onSearch: (value: string) => void
}

const formatDate = (value: string | null) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }
  return date.toLocaleString()
}

const EntryList = ({ entries, selected, onSelect, onCreate, search, onSearch }: Props) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 pb-3">
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          placeholder="Search entries"
        />
        <button
          type="button"
          onClick={onCreate}
          className="rounded border border-black px-3 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
        >
          New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto rounded border border-zinc-200 bg-white">
        {entries.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">No entries yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <button
                  type="button"
                  onClick={() => onSelect(entry.slug)}
                  className={`w-full px-3 py-3 text-left transition ${
                    selected === entry.slug ? 'bg-black text-white' : 'hover:bg-zinc-100'
                  }`}
                >
                  <div className="text-sm font-medium">{entry.title}</div>
                  <div className={`text-xs ${selected === entry.slug ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {entry.slug}
                  </div>
                  <div className={`text-xs ${selected === entry.slug ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    Updated {formatDate(entry.updatedAt)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export type { Entry }
export default EntryList
