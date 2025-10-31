// app/(site)/ar/maps/page.tsx
import dynamic from 'next/dynamic';

export const metadata = {
  title: 'الخريطة',
  description: 'أماكن فلسطين — عرض تفاعلي.',
  alternates: { languages: { en: '/maps' } },
} as const;

// Client-only Leaflet map
const MapClient = dynamic(() => import('@/components/MapClient'), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="h-[80vh]">
        <MapClient />
      </div>
    </main>
  );
}
