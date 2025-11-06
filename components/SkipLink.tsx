import type { Locale } from '@/components/LocaleLink';

const labels: Record<Locale, string> = {
  en: 'Skip to main content',
  ar: 'تجاوز إلى المحتوى',
};

const baseClasses =
  'sr-only focus:not-sr-only focus:absolute focus:top-3 focus:z-50 rounded bg-white px-3 py-1 text-sm shadow';
const directionalClasses = 'ltr:focus:left-3 rtl:focus:right-3';

type SkipLinkProps = {
  locale: Locale;
};

export default function SkipLink({ locale }: SkipLinkProps) {
  const label = labels[locale] ?? labels.en;
  return (
    <a href="#main" className={`${baseClasses} ${directionalClasses}`}>
      {label}
    </a>
  );
}
