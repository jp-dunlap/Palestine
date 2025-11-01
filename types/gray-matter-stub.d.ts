declare module 'gray-matter' {
  type AnyRecord = Record<string, any>;
  export interface GrayMatterFile<T = AnyRecord> {
    data: T;
    content: string;
    excerpt?: string;
    orig?: Buffer | string;
    language?: string;
    matter?: string;
    [k: string]: any;
  }
  const matter: (input: any, options?: any) => GrayMatterFile;
  export default matter;
}
