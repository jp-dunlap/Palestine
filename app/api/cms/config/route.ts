export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

const DEFAULT_REPO = 'jp-dunlap/Palestine';
const DEFAULT_BRANCH =
  process.env.CMS_GITHUB_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? 'main';

function parseMode() {
  const value = (process.env.CMS_MODE ?? 'token').toLowerCase();
  return value === 'oauth' ? 'oauth' : 'token';
}

function getTokenBackend() {
  const token = process.env.CMS_GITHUB_TOKEN;
  if (!token) {
    throw new Error('CMS_GITHUB_TOKEN is required when CMS_MODE=token');
  }
  return {
    name: 'github',
    repo: process.env.CMS_GITHUB_REPO ?? DEFAULT_REPO,
    branch: DEFAULT_BRANCH,
    auth_type: 'token',
    token,
    use_graphql: false,
  } as const;
}

// Only require CLIENT_ID here; CLIENT_SECRET is enforced in /callback.
function getOAuthBackend(origin: string) {
  return {
    name: 'github',
    repo: process.env.CMS_GITHUB_REPO ?? DEFAULT_REPO,
    branch: DEFAULT_BRANCH,
    base_url: `${origin}/api/cms/oauth`,
    auth_endpoint: 'authorize',
    use_graphql: false,
  } as const;
}

function chapterFields(language: 'en' | 'ar') {
  return [
    { label: 'Title', name: 'title', widget: 'string' },
    { label: 'Slug', name: 'slug', widget: 'string' },
    { label: 'Era', name: 'era', widget: 'string', required: false },
    {
      label: 'Authors',
      name: 'authors',
      widget: 'list',
      field: { label: 'Author', name: 'author', widget: 'string' },
      required: false,
    },
    { label: 'Language', name: 'language', widget: 'hidden', default: language },
    { label: 'Summary', name: 'summary', widget: 'text', required: false },
    {
      label: 'Date',
      name: 'date',
      widget: 'datetime',
      time_format: false,
      format: 'YYYY-MM-DD',
      required: false,
    },
    { label: 'Tags', name: 'tags', widget: 'list', required: false },
    {
      label: 'Sources',
      name: 'sources',
      widget: 'list',
      required: false,
      fields: [
        { label: 'Bibliography ID', name: 'id', widget: 'string', required: false },
        { label: 'Source URL', name: 'url', widget: 'string', required: false },
      ],
    },
    { label: 'Places', name: 'places', widget: 'list', required: false },
    { label: 'Body', name: 'body', widget: 'markdown' },
  ];
}

function timelineFields(includeArabic: boolean) {
  const base = [
    { label: 'ID', name: 'id', widget: 'string' },
    { label: 'Title', name: 'title', widget: 'string' },
    {
      label: 'Title (Arabic)',
      name: 'title_ar',
      widget: 'string',
      required: !includeArabic,
      default: '',
    },
    {
      label: 'Start Year',
      name: 'start',
      widget: 'number',
      value_type: 'int',
      hint: 'Negative numbers represent BCE years.',
    },
    { label: 'End Year', name: 'end', widget: 'number', value_type: 'int', required: false },
    { label: 'Summary', name: 'summary', widget: 'text', required: false },
    {
      label: 'Summary (Arabic)',
      name: 'summary_ar',
      widget: 'text',
      required: !includeArabic,
      default: '',
    },
    { label: 'Places', name: 'places', widget: 'list', required: false },
    {
      label: 'Sources',
      name: 'sources',
      widget: 'list',
      field: { label: 'Reference', name: 'reference', widget: 'string' },
      required: false,
    },
    { label: 'Tags', name: 'tags', widget: 'list', required: false },
    { label: 'Tags (Arabic)', name: 'tags_ar', widget: 'list', required: !includeArabic, default: [] },
    {
      label: 'Certainty',
      name: 'certainty',
      widget: 'select',
      options: [
        { label: 'High confidence', value: 'high' },
        { label: 'Medium confidence', value: 'medium' },
        { label: 'Low confidence', value: 'low' },
      ],
      required: false,
    },
  ];
  if (!includeArabic) {
    return base.filter((f) => !['title_ar', 'summary_ar', 'tags_ar'].includes((f as any).name));
  }
  return base;
}

function bibliographyCollection() {
  return {
    name: 'bibliography',
    label: 'Bibliography',
    editor: { preview: false },
    files: [
      {
        label: 'Bibliography Entries',
        name: 'entries',
        file: 'data/bibliography.json',
        format: 'json',
        fields: [
          {
            label: 'Entries',
            name: 'entries',
            widget: 'list',
            label_singular: 'Entry',
            field: { label: 'CSL JSON Entry', name: 'json', widget: 'json' },
          },
        ],
      },
    ],
  };
}

function gazetteerCollection() {
  return {
    name: 'gazetteer',
    label: 'Gazetteer',
    editor: { preview: false },
    files: [
      {
        label: 'Gazetteer Entries',
        name: 'places',
        file: 'data/gazetteer.json',
        format: 'json',
        fields: [
          {
            label: 'Places',
            name: 'entries',
            widget: 'list',
            label_singular: 'Place',
            field: { label: 'Place JSON', name: 'json', widget: 'json' },
          },
        ],
      },
    ],
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = parseMode();
    const backend = mode === 'token' ? getTokenBackend() : getOAuthBackend(url.origin);

    const config = {
      backend,
      publish_mode: 'simple',
      media_folder: 'public/images/uploads',
      public_folder: '/images/uploads',
      collections: [
        {
          name: 'chapters_en',
          label: 'Chapters (English)',
          label_singular: 'Chapter',
          folder: 'content/chapters',
          extension: 'mdx',
          format: 'frontmatter',
          create: true,
          filter: { field: 'language', value: 'en' },
          slug: '{{slug}}',
          fields: chapterFields('en'),
        },
        {
          name: 'chapters_ar',
          label: 'Chapters (Arabic)',
          label_singular: 'Arabic Chapter',
          folder: 'content/chapters',
          extension: 'mdx',
          format: 'frontmatter',
          create: true,
          filter: { field: 'language', value: 'ar' },
          slug: '{{slug}}.ar',
          fields: chapterFields('ar'),
        },
        {
          name: 'timeline_content',
          label: 'Timeline — Content',
          folder: 'content/timeline',
          extension: 'yml',
          format: 'yml',
          create: true,
          slug: '{{id}}',
          fields: timelineFields(false),
        },
        {
          name: 'timeline_data',
          label: 'Timeline — Data',
          folder: 'data/timeline',
          extension: 'yml',
          format: 'yml',
          create: true,
          slug: '{{id}}',
          fields: timelineFields(true),
        },
        bibliographyCollection(),
        gazetteerCollection(),
      ],
    } satisfies Record<string, unknown>;

    return NextResponse.json(config, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CMS configuration failed';
    return new NextResponse(message, { status: 500 });
  }
}
