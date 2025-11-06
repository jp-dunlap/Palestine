import { ImageResponse } from 'next/og';
import { loadLessonFrontmatter } from '@/lib/loaders.lessons';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage({ params }: { params: { slug: string } }) {
  let title = 'Palestine: Learn';
  let summary: string | undefined;

  try {
    const frontmatter = loadLessonFrontmatter(params.slug);
    title = frontmatter.title ?? title;
    summary = frontmatter.summary?.trim() || undefined;
  } catch {
    // fall back to defaults if lesson missing
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
        <div style={{ opacity: 0.7, fontSize: 22, letterSpacing: 2 }}>LEARN • PALESTINE</div>
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
