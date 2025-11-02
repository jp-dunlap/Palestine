export type SearchDoc = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  href: string;
  lang: 'en' | 'ar';
  type: 'chapter' | 'event' | 'place';
};

export declare function loadChapterDocs(): Promise<SearchDoc[]>;
export declare function loadTimelineDocs(): Promise<SearchDoc[]>;
export declare function loadPlaceDocs(): Promise<SearchDoc[]>;
