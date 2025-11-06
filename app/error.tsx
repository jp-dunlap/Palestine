'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import FocusHeading from '@/components/FocusHeading';
import { interVariable, naskhVariable } from '@/app/ui/fonts';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const fontClass = [interVariable, naskhVariable].filter(Boolean).join(' ');

  return (
    <html lang="en" className={fontClass}>
      <body className="font-sans bg-white text-gray-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 rounded bg-white px-3 py-1 text-sm shadow"
        >
          Skip to main content
        </a>
        <main
          id="main"
          className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center"
        >
          <FocusHeading className="text-4xl font-bold tracking-tight">Something went wrong</FocusHeading>
          <p className="max-w-xl text-base text-gray-700">
            An unexpected error occurred. You can try the action again or head back to the homepage.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            <button
              type="button"
              onClick={reset}
              className="rounded border border-gray-900 px-4 py-2 text-gray-900 transition hover:bg-gray-900 hover:text-white"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded border border-transparent px-4 py-2 text-gray-900 underline underline-offset-4 transition hover:text-gray-700"
            >
              Return home
            </Link>
            <Link
              href="/timeline"
              className="rounded border border-transparent px-4 py-2 text-gray-900 underline underline-offset-4 transition hover:text-gray-700"
            >
              View the timeline
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
