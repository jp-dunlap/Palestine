import type { ReactNode } from 'react';

export const metadata = {
  title: 'Timeline',
};

export default function TimelineLayout({ children }: { children: ReactNode }) {
  // Global CSS must be imported only by app/layout.tsx.
  return <section>{children}</section>;
}
