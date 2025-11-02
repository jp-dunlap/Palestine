import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404 — Page not found</h1>
      <p className="max-w-xl text-base text-gray-600">
        We couldn’t find the page you were looking for. It might have been moved or removed.
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
        <Link
          href="/"
          className="rounded px-4 py-2 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          Return home
        </Link>
        <Link
          href="/ar"
          className="rounded px-4 py-2 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          العربية
        </Link>
      </nav>
    </main>
  );
}
