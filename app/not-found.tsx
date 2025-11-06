import LocaleLink from '@/components/LocaleLink';
import type { Metadata } from 'next';

import FocusHeading from '@/components/FocusHeading';

export const metadata: Metadata = {
  title: 'Page not found — Palestine',
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center"
    >
      <FocusHeading className="text-4xl font-bold tracking-tight">Page not found</FocusHeading>
      <p className="max-w-xl text-base text-gray-700">
        The page you requested does not exist or may have been moved. Please return to the homepage or explore the timeline.
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
        <LocaleLink
          href="/"
          locale="en"
          className="rounded border border-gray-900 px-4 py-2 text-gray-900 transition hover:bg-gray-900 hover:text-white"
        >
          Return home
        </LocaleLink>
        <LocaleLink
          href="/timeline"
          locale="en"
          className="rounded px-4 py-2 text-gray-900 underline underline-offset-4 transition hover:text-gray-700"
        >
          View the timeline
        </LocaleLink>
      </nav>
    </main>
  );
}
