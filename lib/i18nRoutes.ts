export type Locale = 'en' | 'ar';

type QueryInput =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | string[] | undefined>
  | Array<[string, string]>;

function normalisePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }
  const trimmed = pathname.trim();
  if (trimmed === '') return '/';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const normalised = withSlash.replace(/\/+/g, '/');
  return normalised === '' ? '/' : normalised;
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

function buildSearch(query?: QueryInput): string {
  if (!query) return '';
  if (typeof query === 'string') {
    const trimmed = query.trim().replace(/^\?/, '');
    return trimmed ? `?${trimmed}` : '';
  }
  const params = new URLSearchParams();
  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
  } else if (Array.isArray(query)) {
    for (const [key, value] of query) {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    }
  } else {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null) {
            params.append(key, String(v));
          }
        });
      } else if (typeof value === 'boolean') {
        params.append(key, value ? 'true' : 'false');
      } else {
        params.append(key, String(value));
      }
    }
  }
  const serialised = params.toString();
  return serialised ? `?${serialised}` : '';
}

export function buildLanguageToggleHref(
  pathname: string,
  query: QueryInput | undefined,
  targetLocale: Locale
): string {
  const withoutAr = stripArabicPrefix(pathname);
  const search = buildSearch(query);

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
