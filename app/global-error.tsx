'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <main className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600">
            The site encountered an error. Please try again.
          </p>
          <div className="mt-4">
            <button className="rounded border px-3 py-2 text-sm hover:bg-gray-50" onClick={reset}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
