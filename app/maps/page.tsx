import { loadGazetteer } from '@/lib/loaders.places';

export default function Page() {
  const places = loadGazetteer();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
      <p className="mt-2 text-sm text-gray-600">
        Loaded from <code>data/gazetteer.json</code>
      </p>

<ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
  {places.map(p => (
    <li key={p.id} className="rounded border p-3 hover:bg-gray-50">
      <div className="font-medium">{p.name}</div>
      <div className="text-sm text-gray-600">
        {p.kind} · {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
      </div>
      {p.alt_names?.length ? (
        <div className="text-xs text-gray-500 mt-1">
          Also known as: {p.alt_names.join(', ')}
        </div>
      ) : null}
    </li>
  ))}
</ul>
    </main>
  );
}
