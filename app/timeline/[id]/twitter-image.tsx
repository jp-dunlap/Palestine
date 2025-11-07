import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';
import { getTimelineEventById } from '@/lib/loaders.timeline';

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const runtime = 'nodejs';

function formatYearRange(start: number, end: number | null): string | null {
  if (start >= 1) {
    if (typeof end === 'number' && end >= 1 && end !== start) {
      return `${start}\u2013${end}`;
    }
    return `${start}`;
  }
  return null;
}

export default async function TimelineTwitterImage({ params }: { params: { id: string } }) {
  const event = getTimelineEventById(params.id, { locale: 'en' });
  const range = event ? formatYearRange(event.start, event.end) : null;
  return createSocialImage({
    locale: 'en',
    title: event?.title ?? 'Palestine Timeline',
    description: event?.summary ?? null,
    eyebrow: range ? `TIMELINE • ${range}` : 'TIMELINE • PALESTINE',
  });
}
