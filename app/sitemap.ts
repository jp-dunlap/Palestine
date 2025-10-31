// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { loadGazetteer } from '@/lib/loaders.places';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.example';
  const now = new Date().toISOString();

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, alternates: { languages: { en: `${base}/`, ar: `${base}/ar` } } },
    { url: `${base}/maps`, lastModified: now, alternates: { languages: { en: `${base}/maps`, ar: `${base}/ar/maps` } } },
    { url: `${base}/timeline`, lastModified: now },
    { url: `${base}/ar`, lastModified: now, alternates: { languages: { en: `${base}/`, ar: `${base}/ar` } } },
    { url: `${base}/ar/maps`, lastModified: now, alternates: { languages: { en: `${base}/maps`, ar: `${base}/ar/maps` } } },
    // Add chapters as you publish them (EN + AR pairs)
    // { url: `${base}/chapters/001-prologue`, lastModified: now, alternates: { languages: { en: `${base}/chapters/001-prologue`, ar: `${base}/ar/chapters/001-prologue` } } },
  ];

  // Places (EN + AR paths)
  try {
    const places = loadGazetteer();
    for (const p of places) {
      urls.push({
        url: `${base}/places/${p.id}`,
        lastModified: now,
        alternates: { languages: { en: `${base}/places/${p.id}`, ar: `${base}/ar/places/${p.id}` } },
      });
      urls.push({
        url: `${base}/ar/places/${p.id}`,
        lastModified: now,
        alternates: { languages: { en: `${base}/places/${p.id}`, ar: `${base}/ar/places/${p.id}` } },
      });
    }
  } catch {
    // if gazetteer missing in some preview builds, just return base routes
  }

  return urls;
}
