import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale }: { locale: 'en' | 'ar' }) {
  const isAr = locale === 'ar';
  const base = isAr ? '/ar' : '';
  const t = {
    title: isAr ? 'فلسطين' : 'Palestine',
    home: isAr ? 'الرئيسية' : 'Home',
    timeline: isAr ? 'الخط الزمني' : 'Timeline',
    map: isAr ? 'الخريطة' : 'Map',
    chapters: isAr ? 'الفصول' : 'Chapters',
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4" aria-label="Primary">
          <Link href={isAr ? '/ar' : '/'} className="font-semibold">{t.title}</Link>
          <Link href={`${base}/timeline`} className="hover:underline">{t.timeline}</Link>
          <Link href={`${base}/map`} className="hover:underline">{t.map}</Link>
          <Link href={`${base}/chapters`} className="hover:underline">{t.chapters}</Link>
        </nav>
        <LanguageSwitcher locale={locale} />
      </div>
    </header>
  );
}
