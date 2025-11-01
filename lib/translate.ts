const AR_RX = /[\u0600-\u06FF]/;

export function hasArabic(s?: string): boolean {
  return typeof s === 'string' && AR_RX.test(s);
}

type TranslateOpts = {
  source?: string;
  target?: string;
  fallback?: string;
};

export async function translateText(
  text: string,
  opts: TranslateOpts = {}
): Promise<string> {
  const { source = 'en', target = 'ar', fallback } = opts;

  if (!text) return fallback ?? '';
  if (hasArabic(text)) return text;

  const base = process.env.LIBRETRANSLATE_URL || process.env.NEXT_PUBLIC_LIBRETRANSLATE_URL;
  if (!base) return fallback ?? text;

  const url = base.endsWith('/translate') ? base : base.replace(/\/$/, '') + '/translate';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: 'text',
        api_key: process.env.LIBRETRANSLATE_API_KEY || undefined
      })
    });
    if (!res.ok) return fallback ?? text;
    const data: any = await res.json();
    const out =
      (typeof data?.translatedText === 'string' && data.translatedText) ||
      (Array.isArray(data) && typeof data[0]?.translatedText === 'string' && data[0].translatedText) ||
      '';
    return out || (fallback ?? text);
  } catch {
    return fallback ?? text;
  }
}
