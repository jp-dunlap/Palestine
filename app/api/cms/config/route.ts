// app/api/cms/config/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const repo = process.env.CMS_GITHUB_REPO || 'jp-dunlap/Palestine';
  const branch = process.env.CMS_GITHUB_BRANCH || 'main';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://palestine-two.vercel.app';
  const mode = process.env.CMS_MODE || 'oauth';

  if (mode !== 'oauth') {
    // We only wire OAuth here; token mode needs a custom gateway (not recommended)
    return new NextResponse('CMS_MODE must be "oauth" for this config endpoint', { status: 500 });
  }

  // Decap reads this and triggers the OAuth flow against our /oauth endpoints.
  const cfg = {
    site_url: siteUrl,
    backend: {
      name: 'github',
      repo,
      branch,
      // Decap docs: when using an external OAuth server/proxy,
      // set base_url (host + optional path) and auth_endpoint.
      // It will open {base_url}/{auth_endpoint} in a popup and expect a postMessage
      // with `authorization:github:success:{...}` carrying the token.
      base_url: `${siteUrl}/api/cms/oauth`,
      auth_endpoint: 'auth',
    },
    media_folder: 'public/images/uploads',
    public_folder: '/images/uploads',
    // Minimal collections to start; expand as needed
    collections: [
      {
        name: 'chapters_en',
        label: 'Chapters (English)',
        folder: 'content/chapters',
        create: true,
        extension: 'mdx',
        format: 'frontmatter',
        filter: { field: 'language', value: 'en' },
        slug: '{{slug}}',
        fields: [
          { name: 'language', widget: 'hidden', default: 'en' },
          { name: 'title', widget: 'string' },
          { name: 'slug', widget: 'string' },
          { name: 'era', widget: 'string' },
          { name: 'authors', widget: 'list' },
          { name: 'summary', widget: 'text' },
          { name: 'tags', widget: 'list' },
          { name: 'date', widget: 'string' },
          { name: 'sources', widget: 'list', fields: [
            { name: 'id', widget: 'string', required: false },
            { name: 'url', widget: 'string', required: false }
          ]},
          { name: 'places', widget: 'list', required: false },
          { name: 'body', widget: 'markdown' }
        ]
      },
      {
        name: 'chapters_ar',
        label: 'Chapters (Arabic)',
        folder: 'content/chapters',
        create: true,
        extension: 'mdx',
        format: 'frontmatter',
        filter: { field: 'language', value: 'ar' },
        slug: '{{slug}}',
        fields: [
          { name: 'language', widget: 'hidden', default: 'ar' },
          { name: 'title', widget: 'string' },
          { name: 'slug', widget: 'string' },
          { name: 'era', widget: 'string' },
          { name: 'authors', widget: 'list' },
          { name: 'summary', widget: 'text' },
          { name: 'tags', widget: 'list' },
          { name: 'date', widget: 'string' },
          { name: 'sources', widget: 'list', fields: [
            { name: 'id', widget: 'string', required: false },
            { name: 'url', widget: 'string', required: false }
          ]},
          { name: 'places', widget: 'list', required: false },
          { name: 'title_ar', widget: 'string', required: false },
          { name: 'summary_ar', widget: 'text', required: false },
          { name: 'tags_ar', widget: 'list', required: false },
          { name: 'body', widget: 'markdown' }
        ]
      },
      {
        name: 'timeline',
        label: 'Timeline — Content',
        folder: 'content/timeline',
        create: true,
        extension: 'yml',
        format: 'yml',
        fields: [
          { name: 'id', widget: 'string' },
          { name: 'title', widget: 'string' },
          { name: 'start', widget: 'number' },
          { name: 'end', widget: 'number', required: false },
          { name: 'places', widget: 'list' },
          { name: 'sources', widget: 'list' },
          { name: 'summary', widget: 'text' },
          { name: 'tags', widget: 'list' },
          { name: 'certainty', widget: 'select', options: ['low', 'medium', 'high'], default: 'medium' }
        ]
      },
      // Bibliography/gazetteer are JSON arrays; you can wire them later with the JSON widget or keep them in Git reviews
    ],
  };

  return NextResponse.json(cfg, { headers: { 'Cache-Control': 'no-store' } });
}
