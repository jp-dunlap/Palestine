import { ImageResponse } from 'next/og';
import type { Locale } from '@/lib/i18nRoutes';

export const socialImageSize = { width: 1200, height: 630 } as const;
export const socialImageContentType = 'image/png';

const fallbackTitle: Record<Locale, string> = {
  en: 'Palestine',
  ar: 'فلسطين',
};

const fallbackDescription: Record<Locale, string> = {
  en: 'A living digital history of Palestinian life, geography, and memory.',
  ar: 'سجلّ رقمي حي للحياة والذاكرة والجغرافيا الفلسطينية.',
};

const fallbackEyebrow: Record<Locale, string> = {
  en: 'PALESTINE • 4,000 YEARS OF MEMORY',
  ar: 'فلسطين • ٤٠٠٠ سنة من الذاكرة',
};

const fallbackFooter: Record<Locale, string> = {
  en: 'palestine.technology',
  ar: 'palestine.technology',
};

type SocialImageOptions = {
  locale: Locale;
  title?: string | null;
  description?: string | null;
  eyebrow?: string | null;
  footer?: string | null;
};

function normaliseLocale(input: Locale | string | null | undefined): Locale {
  return input === 'ar' ? 'ar' : 'en';
}

function normaliseText(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function createSocialImage(options: SocialImageOptions): ImageResponse {
  const locale = normaliseLocale(options.locale);
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const textAlign = direction === 'rtl' ? 'right' : 'left';
  const alignItems = direction === 'rtl' ? 'flex-end' : 'flex-start';
  const gradient = direction === 'rtl'
    ? 'radial-gradient(circle at 100% 100%, #222 0%, #0b0b0b 70%)'
    : 'radial-gradient(circle at 0% 100%, #222 0%, #0b0b0b 70%)';

  const title = normaliseText(options.title) ?? fallbackTitle[locale];
  const description = normaliseText(options.description) ?? fallbackDescription[locale];
  const eyebrow = normaliseText(options.eyebrow) ?? fallbackEyebrow[locale];
  const footerEnv = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.technology';
  const footerDomain = normaliseText(options.footer)
    ?? footerEnv.replace(/^https?:\/\//, '').replace(/\/$/, '')
    ?? fallbackFooter[locale];
  const fontFamily = 'Inter, system-ui, sans-serif';

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
          padding: 72,
          direction,
          textAlign,
          fontFamily,
          backgroundImage: gradient,
        }}
      >
        <div
          style={{
            opacity: 0.75,
            fontSize: locale === 'ar' ? 30 : 24,
            letterSpacing: locale === 'ar' ? '0' : '4px',
            textTransform: locale === 'ar' ? 'none' : 'uppercase',
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems,
            textAlign,
            maxWidth: 920,
          }}
        >
          <div
            style={{
              fontSize: locale === 'ar' ? 70 : 72,
              fontWeight: 700,
              lineHeight: 1.1,
              wordBreak: 'break-word',
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.4,
                opacity: 0.85,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
        <div
          style={{
            opacity: 0.7,
            fontSize: 26,
            display: 'flex',
            justifyContent: alignItems,
          }}
        >
          {footerDomain}
        </div>
      </div>
    ),
    socialImageSize,
  );
}
