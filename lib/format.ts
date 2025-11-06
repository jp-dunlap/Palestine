type NumberFormatOptions = Intl.NumberFormatOptions & { numberingSystem?: string };
type DateFormatOptions = Intl.DateTimeFormatOptions & { numberingSystem?: string };
type FormatYearOptions = {
  unknownLabel?: string;
};

const AR_NUMBERING_SYSTEM: NumberFormatOptions = { numberingSystem: 'arab' };

function getNumberOptions(locale: string, options?: NumberFormatOptions): NumberFormatOptions {
  const base = locale === 'ar' ? AR_NUMBERING_SYSTEM : {};
  return { ...base, ...(options ?? {}) };
}

export function formatNumber(
  value: number | bigint | string,
  locale: string,
  options?: NumberFormatOptions
): string {
  if (value === null || typeof value === 'undefined') return '';
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return value;
    }
    return new Intl.NumberFormat(locale, getNumberOptions(locale, options)).format(parsed);
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return '';
  }
  return new Intl.NumberFormat(locale, getNumberOptions(locale, options)).format(value as number | bigint);
}

export function formatDate(
  value: Date | string | number,
  locale: string,
  options?: DateFormatOptions
): string {
  if (value === null || typeof value === 'undefined') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const formatOptions: DateFormatOptions = {
    ...(locale === 'ar' ? { numberingSystem: 'arab' } : {}),
    ...(options ?? {}),
  };
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

export function formatYear(
  value: number | null | undefined,
  locale: 'en' | 'ar',
  options?: FormatYearOptions
): string {
  if (value === null || typeof value === 'undefined') {
    return options?.unknownLabel ?? '';
  }
  const digits = formatNumber(Math.abs(value), locale, { useGrouping: false });
  if (value < 0) {
    return locale === 'ar' ? `${digits} ق.م.` : `${digits} BCE`;
  }
  return digits;
}
