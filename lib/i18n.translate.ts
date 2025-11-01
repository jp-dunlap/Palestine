import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const AR_RX = /[\u0600-\u06FF]/;
const ROOT = process.cwd();
const CACHE_DIR = process.env.TRANSLATION_CACHE_DIR || path.join(ROOT, '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'translations-ar.json');
const PROVIDER = (process.env.TRANSLATE_PROVIDER || 'libre').toLowerCase();
const LIBRE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com';
const LIBRE_API_KEY = process.env.LIBRETRANSLATE_API_KEY || '';

type CacheShape = Record<string, string>;
let cacheLoaded = false;
let cache: CacheShape = {};

function hasArabic(s?: unknown) {
  return typeof s === 'string' && AR_RX.test(s);
}

function sha1(s: string) {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function ensureCacheLoaded() {
  if (cacheLoaded) return;
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      cache = JSON.parse(raw) as CacheShape;
    }
  } catch {}
  cacheLoaded = true;
}

function saveCache() {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch {}
}

async function translateWithLibre(text: string): Promise<string> {
  const res = await fetch(`${LIBRE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: 'ar',
      format: 'text',
      api_key: LIBRE_API_KEY || undefined,
    }),
  });
  if (!res.ok) return text;
  const data: any = await res.json();
  let out = '';
  if (typeof data?.translatedText === 'string') out = data.translatedText;
  else if (Array.isArray(data) && typeof data[0]?.translatedText === 'string') out = data[0].translatedText;
  return out || text;
}

export async function translateToArabic(text: string): Promise<string> {
  if (!text || hasArabic(text)) return text;
  ensureCacheLoaded();
  const key = sha1('en>ar:' + text);
  if (cache[key]) return cache[key];
  let translated = text;
  try {
    if (PROVIDER === 'libre') translated = await translateWithLibre(text);
    else translated = await translateWithLibre(text);
  } catch {
    translated = text;
  }
  cache[key] = translated;
  saveCache();
  return translated;
}

export async function translateListToArabic(list: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const item of list) {
    out.push(await translateToArabic(item));
  }
  return out;
}

export { hasArabic };
