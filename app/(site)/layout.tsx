// app/(site)/layout.tsx
import type { ReactNode } from 'react';

/**
 * Segment layout for (site).
 * NOTE: Do not render <html> or <body> here; the root layout handles that.
 */
export default function SiteSegmentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
