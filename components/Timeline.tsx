// Placeholder component for future timeline rendering.
// Safe to keep in repo; it exports nothing UI-visible yet.

import type { TimelineEvent, Era } from '@/lib/types';

export type TimelineProps = {
  events?: TimelineEvent[];
  eras?: Era[];
};

export default function Timeline(_props: TimelineProps) {
  // TODO: implement virtualized lanes + scale
  return null;
}
