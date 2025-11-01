import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const base = locale === 'ar' ? '/ar' : '';
  const navClass = 'text-sm hover:underline';
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
      <a href={base || '/'} className="text-base font-semibold">
        {locale === 'ar' ? 'فلسطين' : 'Palestine'}
      </a>
      <nav className="flex items-center gap-5">
        <a href={`${base}/timeline`} className={navClass}>
          {locale === 'ar' ? 'الخطّ الزمني' : 'Timeline'}
        </a>
        <a href={`${base}/map`} className={navClass}>
          {locale === 'ar' ? 'الخريطة' : 'Map'}
        </a>
        <a href={`${base}/chapters`} className={navClass}>
          {locale === 'ar' ? 'الفصول' : 'Chapters'}
        </a>
        <a href={`${base}/about`} className={navClass}>
          {locale === 'ar' ? 'عن المشروع' : 'About'}
        </a>
        <LanguageSwitcher className="rounded border px-2 py-1" />
      </nav>
    </header>
  );
}
