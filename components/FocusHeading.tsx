'use client';

import { createElement, useEffect, useRef, type ComponentPropsWithoutRef, type ElementType } from 'react';

type FocusHeadingProps<T extends ElementType> = {
  as?: T;
  tabIndex?: number;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'ref' | 'tabIndex'>;

export default function FocusHeading<T extends ElementType = 'h1'>(
  { as, children, tabIndex = -1, ...rest }: FocusHeadingProps<T>
) {
  const Tag = (as ?? 'h1') as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return createElement(
    Tag,
    { ...rest, ref, tabIndex } as unknown as ComponentPropsWithoutRef<T>,
    children
  );
}
