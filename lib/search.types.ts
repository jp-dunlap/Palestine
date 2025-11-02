export type SearchDoc = {
  id: string;
  title: string;
  href: string;
  summary?: string;
  tags?: string[];
  lang?: 'en' | 'ar';
  type?: 'chapter' | 'event' | 'place';
};
