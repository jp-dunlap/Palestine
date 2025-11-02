import * as React from 'react';

type FootnoteEntry = {
  index: number;
  noteId: string;
  refId: string;
  content: React.ReactNode;
  displayNumber: string;
};

type Locale = 'en' | 'ar';

function numberFormatter(locale: Locale) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');
}

export function createFootnotesManager(locale: Locale = 'en') {
  let counter = 0;
  const notes: FootnoteEntry[] = [];

  const formatter = numberFormatter(locale);
  const heading = locale === 'ar' ? 'حواشي' : 'Footnotes';
  const backLabel = locale === 'ar' ? 'عودة إلى النص' : 'Back to text';
  const footnoteLabel = (value: string) =>
    locale === 'ar' ? `حاشية ${value}` : `Footnote ${value}`;
  const backLabelWithNumber = (value: string) =>
    locale === 'ar' ? `عودة إلى النص ${value}` : `Back to text ${value}`;

  function ensureNote(entry: FootnoteEntry) {
    const existing = notes.find((note) => note.refId === entry.refId);
    if (!existing) {
      notes.push(entry);
    }
  }

  function Footnote({ children }: { children: React.ReactNode }) {
    counter += 1;
    const index = counter;
    const displayNumber = formatter.format(index);
    const noteId = `footnote-${index}`;
    const refId = `footnote-ref-${index}`;

    ensureNote({ index, noteId, refId, content: children, displayNumber });

    return (
      <sup id={refId} data-footnote-index={index}>
        <a
          href={`#${noteId}`}
          className="footnote-ref underline decoration-dotted underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          aria-label={footnoteLabel(displayNumber)}
        >
          [{displayNumber}]
        </a>
      </sup>
    );
  }

  function FootnotesSection() {
    if (notes.length === 0) return null;
    const sorted = [...notes].sort((a, b) => a.index - b.index);
    return (
      <section className="mt-10" id="footnotes" aria-labelledby="footnotes-heading">
        <h2 id="footnotes-heading" className="text-sm font-semibold text-gray-700">
          {heading}
        </h2>
        <ol className="mt-2 list-decimal pl-6 text-sm text-gray-700 space-y-2">
          {sorted.map((note) => (
            <li key={note.noteId} id={note.noteId} className="space-y-1">
              <div>{note.content}</div>
              <a
                href={`#${note.refId}`}
                className="text-xs underline hover:no-underline"
                aria-label={backLabelWithNumber(note.displayNumber)}
              >
                {backLabel}
              </a>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return { Footnote, FootnotesSection };
}
