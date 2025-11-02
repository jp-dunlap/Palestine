import { ImageResponse } from 'next/og';
import { getTimelineEventById } from '@/lib/loaders.timeline';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function formatYearRange(start: number, end: number | null): string | null {
  if (start >= 1) {
    if (typeof end === 'number' && end >= 1 && end !== start) {
      return `${start}\u2013${end}`;
    }
    return `${start}`;
  }
  return null;
}

export default function OgImage({ params }: { params: { id: string } }) {
  let title = 'Palestine Timeline';
  let summary: string | undefined;
  let detail = 'TIMELINE EVENT';

  const event = getTimelineEventById(params.id, { locale: 'en' });
  if (event) {
    title = event.title || title;
    summary = event.summary?.trim() || undefined;
    const range = formatYearRange(event.start, event.end);
    detail = range ? `TIMELINE • ${range}` : 'TIMELINE EVENT';
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0b0b0b',
          color: '#fdfdfd',
          padding: 64,
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundImage: 'radial-gradient(circle at 0% 100%, #222 0%, #0b0b0b 70%)',
        }}
      >
        <div style={{ opacity: 0.7, fontSize: 24, letterSpacing: 2 }}>{detail}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 920 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
          {summary ? (
            <div style={{ fontSize: 30, lineHeight: 1.4, opacity: 0.85 }}>{summary}</div>
          ) : null}
        </div>
      </div>
    ),
    size
  );
}
