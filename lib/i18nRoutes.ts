export type Locale = 'en' | 'ar';

type QueryInput =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | string[] | undefined>
  | Array<[string, string]>;

type ParsedHref = {
  pathname: string;
  searchParams: URLSearchParams;
};

function normalisePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }
  const trimmed = pathname.trim();
  if (!trimmed) return '/';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const normalised = withSlash.replace(/\\+/g, '/');
  return normalised === '' ? '/' : normalised;
}

function parseHref(input: string): ParsedHref {
  if (!input) {
    return { pathname: '/', searchParams: new URLSearchParams() };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { pathname: '/', searchParams: new URLSearchParams() };
  }

  try {
    const base = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? undefined
      : 'https://toggle.local';
    const url = new URL(trimmed, base);
    return {
      pathname: normalisePath(url.pathname || '/'),
      searchParams: new URLSearchParams(url.search ?? ''),
    };
  } catch {
    const [rawPath, rawQuery] = trimmed.split('?');
    return {
      pathname: normalisePath(rawPath ?? '/'),
      searchParams: new URLSearchParams(rawQuery ?? ''),
    };
  }
}

function stripArabicPrefix(pathname: string): string {
  const normalised = normalisePath(pathname);
  if (normalised === '/ar') {
    return '/';
  }
  if (normalised.startsWith('/ar/')) {
    const rest = normalised.slice(3);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return normalised;
}

function applyQueryInput(params: URLSearchParams, query?: QueryInput) {
  if (!query) return;
  if (typeof query === 'string') {
    const trimmed = query.trim().replace(/^\?/, '');
    if (!trimmed) return;
    const extra = new URLSearchParams(trimmed);
    extra.forEach((value, key) => {
      params.set(key, value);
    });
    return;
  }
  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      if (value !== undefined && value !== null) {
        params.set(key, value);
      }
    });
    return;
  }
  if (Array.isArray(query)) {
    for (const [key, value] of query) {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    }
    return;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      params.delete(key);
      value.forEach((v) => {
        if (v !== undefined && v !== null) {
          params.append(key, String(v));
        }
      });
    } else if (typeof value === 'boolean') {
      params.set(key, value ? 'true' : 'false');
    } else {
      params.set(key, String(value));
    }
  }
}

function formatSearch(params: URLSearchParams): string {
  const serialised = params.toString();
  return serialised ? `?${serialised}` : '';
}

export function buildLanguageToggleHref(
  pathname: string,
  query: QueryInput | undefined,
  targetLocale: Locale
): string {
  const { pathname: rawPath, searchParams } = parseHref(pathname);
  const withoutAr = stripArabicPrefix(rawPath);
  const params = new URLSearchParams(searchParams);
  applyQueryInput(params, query);
  const search = formatSearch(params);

  if (targetLocale === 'ar') {
    const suffix = withoutAr === '/' ? '' : withoutAr;
    return `/ar${suffix}${search}` || '/ar';
  }

  const base = withoutAr || '/';
  return `${base}${search}` || '/';
}

export function deriveAlternateHref(
  currentPath: string,
  query: QueryInput | undefined,
  targetLocale: Locale
): string {
  return buildLanguageToggleHref(currentPath, query, targetLocale);
}
