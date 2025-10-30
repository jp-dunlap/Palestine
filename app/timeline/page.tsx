import { loadTimeline } from '@/lib/loaders';

function fmtYear(y: number) {
  return y < 0 ? `${Math.abs(y)} BCE` : `${y}`;
}
function fmtRange(start: number, end: number | null) {
  return end && end !== start ? `${fmtYear(start)}–${fmtYear(end)}` : fmtYear(start);
}

export default function Page() {
  const events = loadTimeline();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Timeline</h1>

      <ul className="space-y-6">
        {events.map(ev => (
          <li key={ev.id} className="border-l pl-4">
            <div className="text-sm text-gray-500">{fmtRange(ev.start, ev.end)}</div>
            <h2 className="text-lg font-medium">{ev.title}</h2>
            {ev.summary && <p className="text-gray-700">{ev.summary}</p>}
            {ev.places?.length ? (
              <div className="mt-1 text-xs text-gray-600">
                Places: {ev.places.join(', ')}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <footer className="mt-10 text-xs text-gray-500">
        Rendered from <code>content/timeline/*.yml</code>
      </footer>
    </main>
  );
}
