import LocaleLink from '@/components/LocaleLink';
import { loadLessonFrontmatter, loadLessonSlugs } from '@/lib/loaders.lessons';

export const metadata = {
  title: 'Learning modules',
  description: 'Facilitator-ready lessons, discussion prompts, and resources for workshops on Palestinian history.',
  alternates: {
    canonical: '/learn',
    languages: { en: '/learn', ar: '/ar/learn', 'x-default': '/learn' },
  },
  openGraph: { url: '/learn' },
  twitter: {
    card: 'summary_large_image',
    title: 'Learning modules',
    description: 'Facilitator-ready lessons, discussion prompts, and resources for workshops on Palestinian history.',
  },
};

export default function LearnIndexPage() {
  const slugs = loadLessonSlugs();
  const lessons = slugs.map((slug) => loadLessonFrontmatter(slug));

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Learning modules</h1>
      <p className="mt-2 text-base text-gray-600">
        Use these facilitator-ready lessons to host community teach-ins, study circles, and workshops. Each module is licensed for
        movement use—adapt and remix with attribution.
      </p>

      <ul className="mt-6 space-y-4">
        {lessons.map((lesson) => (
          <li key={lesson.slug} className="rounded border p-4 shadow-sm">
            <h2 className="text-lg font-semibold">
              <LocaleLink className="underline hover:no-underline" href={`/learn/${lesson.slug}`} locale="en">
                {lesson.title}
              </LocaleLink>
            </h2>
            {lesson.summary ? <p className="mt-2 text-sm text-gray-700">{lesson.summary}</p> : null}
            {lesson.updated ? (
              <p className="mt-2 text-xs text-gray-700">Last updated {lesson.updated}</p>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-gray-700">
        Have a community curriculum to share?{' '}
        <LocaleLink className="underline hover:no-underline" href="/submit" locale="en">
          Propose it here.
        </LocaleLink>
      </p>
    </main>
  );
}
