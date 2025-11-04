
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

const DEFAULT_REPO = 'jp-dunlap/Palestine';
const DEFAULT_BRANCH =
  process.env.CMS_GITHUB_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? 'main';

function getOAuthBackend(origin: string) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is required for GitHub OAuth backend');
  }
  return {
    name: 'github',
    repo: process.env.CMS_GITHUB_REPO ?? DEFAULT_REPO,
    branch: DEFAULT_BRANCH,
    base_url: `${origin}/api/cms/oauth`,
    auth_endpoint: 'authorize', // matches your file path
    use_graphql: false,
  } as const;
}

function chapterFields(language: 'en' | 'ar') {
  return [
    { label: 'Title', name: 'title', widget: 'string' },
    { label: 'Slug', name: 'slug', widget: 'string' },
    { label: 'Era', name: 'era', widget: 'string', required: false },
    { label: 'Authors', name: 'authors', widget: 'list',
      field: { label: 'Author', name: 'author', widget: 'string' }, required: false },
    { label: 'Language', name: 'language', widget: 'hidden', default: language },
    { label: 'Summary', name: 'summary', widget: 'text', required: false },
    { label: 'Date', name: 'date', widget: 'datetime', time_format: false, format: 'YYYY-MM-DD', required: false },
    { label: 'Tags', name: 'tags', widget: 'list', required: false },
    { label: 'Sources', name: 'sources', widget: 'list', required: false,
      fields: [
        { label: 'Bibliography ID', name: 'id', widget: 'string', required: false },
        { label: 'Source URL', name: 'url', widget: 'string', required: false },
      ] },
    { label: 'Places', name: 'places', widget: 'list', required: false },
    { label: 'Body', name: 'body', widget: 'markdown' },
  ];
}

export async function GET(req: Request) {
  try {
    const origin = new URL(req.url).origin;

    const config = {
      backend: getOAuthBackend(origin),
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
          fields: [
            { label: 'ID', name: 'id', widget: 'string' },
            { label: 'Title', name: 'title', widget: 'string' },
            { label: 'Start Year', name: 'start', widget: 'number', value_type: 'int',
              hint: 'Negative numbers represent BCE years.' },
            { label: 'End Year', name: 'end', widget: 'number', value_type: 'int', required: false },
            { label: 'Summary', name: 'summary', widget: 'text', required: false },
            { label: 'Places', name: 'places', widget: 'list', required: false },
            { label: 'Sources', name: 'sources', widget: 'list',
              field: { label: 'Reference', name: 'reference', widget: 'string' }, required: false },
            { label: 'Tags', name: 'tags', widget: 'list', required: false },
            { label: 'Certainty', name: 'certainty', widget: 'select', options: [
                { label: 'High confidence', value: 'high' },
                { label: 'Medium confidence', value: 'medium' },
                { label: 'Low confidence', value: 'low' },
              ], required: false },
          ],
        },
        {
          name: 'timeline_data',
          label: 'Timeline — Data',
          folder: 'data/timeline',
          extension: 'yml',
          format: 'yml',
          create: true,
          slug: '{{id}}',
          fields: [
            { label: 'ID', name: 'id', widget: 'string' },
            { label: 'Title', name: 'title', widget: 'string' },
            { label: 'Title (Arabic)', name: 'title_ar', widget: 'string', required: false, default: '' },
            { label: 'Start Year', name: 'start', widget: 'number', value_type: 'int',
              hint: 'Negative numbers represent BCE years.' },
            { label: 'End Year', name: 'end', widget: 'number', value_type: 'int', required: false },
            { label: 'Summary', name: 'summary', widget: 'text', required: false },
            { label: 'Summary (Arabic)', name: 'summary_ar', widget: 'text', required: false, default: '' },
            { label: 'Places', name: 'places', widget: 'list', required: false },
            { label: 'Sources', name: 'sources', widget: 'list',
              field: { label: 'Reference', name: 'reference', widget: 'string' }, required: false },
            { label: 'Tags', name: 'tags', widget: 'list', required: false },
            { label: 'Tags (Arabic)', name: 'tags_ar', widget: 'list', required: false, default: [] },
            { label: 'Certainty', name: 'certainty', widget: 'select', options: [
                { label: 'High confidence', value: 'high' },
                { label: 'Medium confidence', value: 'medium' },
                { label: 'Low confidence', value: 'low' },
              ], required: false },
          ],
        },
        {
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
                { label: 'Entries', name: 'entries', widget: 'list', label_singular: 'Entry',
                  field: { label: 'CSL JSON Entry', name: 'json', widget: 'json' } },
              ],
            },
          ],
        },
        {
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
                { label: 'Places', name: 'entries', widget: 'list', label_singular: 'Place',
                  field: { label: 'Place JSON', name: 'json', widget: 'json' } },
              ],
            },
          ],
        },
      ],
    };

    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CMS configuration failed';
    return new NextResponse(message, { status: 500 });
  }
}
