export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Palestine</h1>
        <p className="mt-2 text-base text-gray-600">
          A public, art-grade digital history spanning 4,000 years — centering Palestinian life,
          sources, and anti-colonial memory.
        </p>
      </header>

      <section className="space-y-4">
        <a href="/timeline" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
          Explore the timeline
        </a>
        <a href="/maps" className="ml-3 inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
          View places on the map
        </a>
      </section>

      <footer className="mt-12 text-xs text-gray-500">
        Code: MIT · Content: CC BY-SA 4.0
      </footer>
    </main>
  );
}
