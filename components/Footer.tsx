export default function Footer({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  return (
    <footer className="mx-auto mt-16 max-w-5xl px-4 py-10 text-xs text-gray-500">
      <div className="flex flex-col gap-1">
        <div>
          {locale === 'ar' ? 'الشيفرة: MIT · المحتوى: CC BY-SA 4.0' : 'Code: MIT · Content: CC BY-SA 4.0'}
        </div>
        <div>
          {locale === 'ar'
            ? 'المصدر المفتوح والتعاون متاحان عبر GitHub.'
            : 'Open source and contributions welcome on GitHub.'}
        </div>
      </div>
    </footer>
  );
}
