export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        The page you’re looking for doesn’t exist.
      </p>
      <div className="mt-4">
        <a href="/" className="underline">Go home</a>
      </div>
    </main>
  );
}
