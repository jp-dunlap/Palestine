import crypto from 'node:crypto';

const cache = new Map<string, Promise<string>>();

type TranslateOptions = {
  target: string;
  source?: string;
  fallback?: string;
};

/**
 * Translate text using a LibreTranslate-compatible API.
 * Falls back to the original text when no service is configured or on error.
 */
export async function translateText(text: string, options: TranslateOptions): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) return text;

  const target = options.target;
  const source = options.source ?? 'en';
  const fallback = options.fallback ?? text;
  const endpoint = process.env.LIBRETRANSLATE_URL;

  if (!endpoint) return fallback;

  const cacheKey = `${source}:${target}:${crypto.createHash('sha1').update(trimmed).digest('hex')}`;
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, requestTranslation(trimmed, { source, target }).catch(() => fallback));
  }

  return cache.get(cacheKey)!;
}

async function requestTranslation(text: string, opts: { source: string; target: string }): Promise<string> {
  const endpoint = process.env.LIBRETRANSLATE_URL!;
  const url = endpoint.replace(/\/$/, '') + '/translate';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.LIBRETRANSLATE_KEY ? { Authorization: `Bearer ${process.env.LIBRETRANSLATE_KEY}` } : {}),
    },
    body: JSON.stringify({
      q: text,
      source: opts.source,
      target: opts.target,
      format: 'text',
    }),
  });

  if (!res.ok) {
    throw new Error(`translate ${res.status}`);
  }

  const data = (await res.json()) as { translatedText?: string };
  const translated = data.translatedText?.trim();
  if (!translated) throw new Error('empty translation');
  return translated;
}
