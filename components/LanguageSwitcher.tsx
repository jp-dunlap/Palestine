import Link from 'next/link';

export default function LanguageSwitcher({ locale }: { locale: 'en' | 'ar' }) {
  const isAr = locale === 'ar';
  return (
    <div className="flex items-center gap-3">
      {isAr ? (
        <Link href="/" className="underline">English</Link>
      ) : (
        <Link href="/ar" className="underline">العربية</Link>
      )}
    </div>
  );
}
