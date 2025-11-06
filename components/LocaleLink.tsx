"use client";

import Link, { type LinkProps } from 'next/link';
import type { UrlObject } from 'url';
import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
} from 'react';

export type Locale = 'en' | 'ar';

const LocaleContext = createContext<Locale>('en');

export function LocaleProvider({ locale, children }: PropsWithChildren<{ locale: Locale }>) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

function isRelativeHref(href: string): boolean {
  if (!href) return false;
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return false;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return false;
  if (trimmed.startsWith('#')) return false;
  if (trimmed.startsWith('//')) return false;
  return trimmed.startsWith('/');
}

const localePrefixes: Record<Locale, string> = {
  en: '/en',
  ar: '/ar',
};

function hasLocalePrefix(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/') || pathname === '/ar' || pathname.startsWith('/ar/');
}

function ensureLeadingSlash(pathname: string): string {
  if (!pathname) return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function resolveLocalePath(pathname: string, locale: Locale): string {
  const normalised = pathname.trim();
  const withSlash = ensureLeadingSlash(normalised);
  if (hasLocalePrefix(withSlash)) {
    return withSlash;
  }
  if (withSlash === '/' || withSlash === '') {
    return localePrefixes[locale];
  }
  return `${localePrefixes[locale]}${withSlash}`;
}

function mapObjectHref(href: UrlObject, locale: Locale): UrlObject {
  const nextHref: UrlObject = { ...href };
  if (nextHref.pathname) {
    nextHref.pathname = resolveLocalePath(String(nextHref.pathname), locale);
  } else {
    nextHref.pathname = localePrefixes[locale];
  }
  return nextHref;
}

export function resolveLocaleHref(href: LinkProps['href'], locale: Locale): LinkProps['href'] {
  if (typeof href === 'string') {
    const trimmed = href.trim();
    if (!isRelativeHref(trimmed)) {
      return href;
    }
    try {
      const url = new URL(trimmed, 'https://palestine.local');
      const prefixedPath = resolveLocalePath(url.pathname, locale);
      return `${prefixedPath}${url.search}${url.hash}`;
    } catch {
      const [path, rest] = trimmed.split(/(?=[?#])/);
      const prefixedPath = resolveLocalePath(path, locale);
      return `${prefixedPath}${rest ?? ''}`;
    }
  }

  if (href instanceof URL) {
    const cloned = new URL(href.toString());
    cloned.pathname = resolveLocalePath(cloned.pathname, locale);
    return cloned;
  }

  return mapObjectHref(href, locale);
}

type LocaleLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> & {
  href: LinkProps['href'];
  locale?: Locale;
};

export default function LocaleLink({ href, locale, ...rest }: LocaleLinkProps) {
  const contextLocale = useContext(LocaleContext);
  const activeLocale = locale ?? contextLocale ?? 'en';
  const resolvedHref = resolveLocaleHref(href, activeLocale);
  return <Link {...rest} href={resolvedHref} />;
}
