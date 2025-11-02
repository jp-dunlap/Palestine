import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

const issueUrl =
  'https://github.com/jp-dunlap/Palestine/issues/new?title=Contribution%20proposal&body=' +
  encodeURIComponent(
    [
      '## Summary',
      'Describe the source, memory, or correction you would like to add.',
      '',
      '## Source details',
      '- Links and scans',
      '- Citation information',
      '',
      '## Preferred contact (optional)',
      'Only include public or burner contacts. This project does not run proprietary telemetry.',
      '',
      '## Notes',
      'Anything else we should know.',
    ].join('\n')
  );

export const metadata = {
  title: 'Submit materials',
  description:
    'Share sources, memories, or corrections with the editorial collective. All submissions go through a public issue queue.',
  alternates: {
    canonical: '/submit',
    languages: { en: '/submit', ar: '/ar/submit', 'x-default': '/submit' },
  },
  openGraph: { url: '/submit' },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit materials',
    description:
      'Share sources, memories, or corrections with the editorial collective. All submissions go through a public issue queue.',
  },
};

export default function SubmitPage() {
  const arabicHref = buildLanguageToggleHref('/submit', undefined, 'ar');
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Submit materials</h1>
      <p className="mt-2 text-base text-gray-600">
        Palestine is stewarded by a volunteer editorial collective. To share sources, memories, or corrections, open a GitHub
        issue with the template below. Submissions are public so the community can collaborate in the open.
      </p>

      <section className="mt-6 space-y-3 text-sm text-gray-700">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">How to contribute</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Review the contribution guidelines in <a className="underline hover:no-underline" href="/CONTRIBUTING">CONTRIBUTING.md</a>.</li>
          <li>Prepare citations, scans, or oral histories. Redact any sensitive metadata before uploading.</li>
          <li>
            Open a public issue using the link below. You can remain pseudonymous; do not share personal phone numbers or
            surveillance-prone contacts.
          </li>
        </ol>
      </section>

      <div className="mt-6">
        <a
          className="inline-flex items-center gap-2 rounded border border-gray-900 px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          href={issueUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open contribution issue →
        </a>
      </div>

      <section className="mt-10 text-sm text-gray-700">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">What happens next?</h2>
        <p className="mt-2">
          The collective reviews contributions weekly. We may reach out via the issue thread if we need clarification or follow-up
          sources. Approved submissions are documented publicly so you can cite the contribution in other movement work.
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-600">
        <a className="underline hover:no-underline" href={arabicHref}>
          اقرأ هذه الصفحة بالعربية →
        </a>
      </p>
    </main>
  );
}
