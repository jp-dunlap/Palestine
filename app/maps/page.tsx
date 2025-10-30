import { loadGazetteer } from '@/lib/loaders.places';

export default function Page() {
  const places = loadGazetteer();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
      <p className="mt-2 text-sm text-gray-600">
        Loaded from <code>data/gazetteer.json</code>
      </p>

      <ul className="mt-6 divide-y">
        {places.map(p => (
          <li key={p.id} className="py-3">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-600">
              {p.kind} · {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
            </div>
            {p.alt_names?.length ? (
              <div className="text-xs text-gray-500">Also known as: {p.alt_names.join(', ')}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
