import path from 'path'
import type { GitHubClient } from './github'
import { listDirectory } from './github'
import {
  ensureArabicSuffix,
  extractNumericPrefix,
  hasNumericPrefix,
  slugify,
  stripArabicSuffix,
  stripNumericPrefix,
} from './slugs'
import { z } from './zod'
import type { ZodSchema } from './zod'

const asDateString = z.effects(z.any(), (value) => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof (value as { toISOString?: unknown }).toISOString === 'function') {
    try {
      return ((value as { toISOString: () => string }).toISOString() ?? '').slice(0, 10)
    } catch {
      return ''
    }
  }
  return ''
})

export type Workflow = 'draft' | 'publish'
export type CollectionFormat = 'markdown' | 'json' | 'yaml'

export type ResolveOpts = { branch?: string }

export type CollectionDefinition = {
  id: string
  label: string
  singleFile?: string
  directory: string
  extension: '.md' | '.mdx' | '.json' | '.yml'
  format: CollectionFormat
  schema: ZodSchema<any>
  defaultWorkflow: Workflow
  slugField: string
  bodyField?: string
  fields: { name: string; type: string; required?: boolean }[]
  filenameFilter?: (name: string) => boolean
  resolvePath?: (client: GitHubClient, slug: string, opts?: ResolveOpts) => Promise<string>
}

const CHAPTERS_DIRECTORY = 'content/chapters'
const CHAPTER_EXTENSION: CollectionDefinition['extension'] = '.mdx'

const nextChapterPrefix = (files: { name: string }[]) => {
  const numbers = files
    .map((file) => extractNumericPrefix(file.name))
    .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value))
  const next = numbers.length === 0 ? 1 : Math.max(...numbers) + 1
  return String(next).padStart(3, '0')
}

export const isArabicFilename = (name: string) => name.endsWith('.ar.mdx')

const resolveChapterPath = (isArabic: boolean) => {
  return async (client: GitHubClient, slug: string, opts?: ResolveOpts) => {
    const branch = opts?.branch
    const entries = await listDirectory(client, CHAPTERS_DIRECTORY, branch).catch(async () => {
      if (!branch) {
        return [] as Awaited<ReturnType<typeof listDirectory>>
      }
      return listDirectory(client, CHAPTERS_DIRECTORY).catch(() => [])
    })
    const extension = CHAPTER_EXTENSION
    const normalizedSlug = path.posix.basename(slug.trim(), extension)

    const ensureEntry = (candidate: string) =>
      entries.find((entry) => entry.type === 'file' && entry.name === `${candidate}${extension}`)

    if (normalizedSlug) {
      const existing = ensureEntry(normalizedSlug)
      if (existing) {
        return existing.path
      }
    }

    const availableFiles = entries.filter((entry) => entry.type === 'file' && entry.name.endsWith(extension))
    const englishFiles = availableFiles.filter((entry) => !isArabicFilename(entry.name))

    if (!isArabic) {
      const sanitizedBase = stripArabicSuffix(stripNumericPrefix(normalizedSlug)) || normalizedSlug
      const sanitized = slugify(sanitizedBase) || 'untitled'
      if (hasNumericPrefix(normalizedSlug) && normalizedSlug) {
        return path.posix.join(CHAPTERS_DIRECTORY, `${normalizedSlug}${extension}`)
      }
      const prefix = nextChapterPrefix(availableFiles)
      return path.posix.join(CHAPTERS_DIRECTORY, `${prefix}-${sanitized}${extension}`)
    }

    const baseWithoutSuffix = stripArabicSuffix(normalizedSlug)
    const arSlug = ensureArabicSuffix(normalizedSlug || '')
    const arExisting = ensureEntry(arSlug)
    if (arExisting) {
      return arExisting.path
    }

    if (hasNumericPrefix(baseWithoutSuffix)) {
      const withPrefix = ensureArabicSuffix(baseWithoutSuffix)
      return path.posix.join(CHAPTERS_DIRECTORY, `${withPrefix}${extension}`)
    }

    const sanitizedBase = slugify(stripNumericPrefix(baseWithoutSuffix) || baseWithoutSuffix) || 'untitled'
    const paired = englishFiles.find((entry) => {
      const base = entry.name.slice(0, -extension.length)
      return stripNumericPrefix(base) === sanitizedBase
    })
    if (paired) {
      const base = paired.name.slice(0, -extension.length)
      return path.posix.join(CHAPTERS_DIRECTORY, `${ensureArabicSuffix(base)}${extension}`)
    }

    const prefix = nextChapterPrefix(availableFiles)
    const fallbackBase = `${prefix}-${sanitizedBase}`
    return path.posix.join(CHAPTERS_DIRECTORY, `${ensureArabicSuffix(fallbackBase)}${extension}`)
  }
}

const timelineSchema = z.object({
  id: z.string().nonempty(),
  title: z.string().nonempty(),
  start: z.number(),
  end: z.union([z.number(), z.literal(null)]).optional(),
  places: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  certainty: z.enum(['low', 'medium', 'high']).default('medium'),
})

const chapterFields = [
  { name: 'title', type: 'string', required: true },
  { name: 'slug', type: 'string', required: true },
  { name: 'era', type: 'string' },
  { name: 'authors', type: 'string[]' },
  { name: 'language', type: 'string', required: true },
  { name: 'summary', type: 'string' },
  { name: 'tags', type: 'string[]' },
  { name: 'date', type: 'string' },
  { name: 'sources', type: 'string[]' },
  { name: 'places', type: 'string[]' },
  { name: 'body', type: 'markdown' },
]

export const collections: CollectionDefinition[] = [
  {
    id: 'chapters_en',
    label: 'Chapters (English)',
    directory: CHAPTERS_DIRECTORY,
    extension: CHAPTER_EXTENSION,
    format: 'markdown',
    schema: z.object({
      title: z.string().nonempty('Title is required'),
      slug: z.string().nonempty('Slug is required'),
      era: z.string().optional(),
      authors: z.array(z.string()).optional(),
      language: z.literal('en'),
      summary: z.string().optional(),
      tags: z.array(z.string()).optional(),
      date: asDateString.optional(),
      sources: z.array(z.union([z.object({ id: z.string().optional(), url: z.string().optional() }), z.string()])).optional(),
      places: z.array(z.string()).optional(),
    }),
    defaultWorkflow: 'draft',
    slugField: 'slug',
    bodyField: 'body',
    fields: chapterFields,
    filenameFilter: (name) => !isArabicFilename(name),
    resolvePath: resolveChapterPath(false),
  },
  {
    id: 'chapters_ar',
    label: 'Chapters (Arabic)',
    directory: CHAPTERS_DIRECTORY,
    extension: CHAPTER_EXTENSION,
    format: 'markdown',
    schema: z.object({
      title: z.string().nonempty('Title is required'),
      slug: z.string().nonempty('Slug is required'),
      era: z.string().optional(),
      authors: z.array(z.string()).optional(),
      language: z.literal('ar'),
      summary: z.string().optional(),
      tags: z.array(z.string()).optional(),
      date: asDateString.optional(),
      sources: z.array(z.union([z.object({ id: z.string().optional(), url: z.string().optional() }), z.string()])).optional(),
      places: z.array(z.string()).optional(),
    }),
    defaultWorkflow: 'draft',
    slugField: 'slug',
    bodyField: 'body',
    fields: chapterFields,
    filenameFilter: (name) => isArabicFilename(name),
    resolvePath: resolveChapterPath(true),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    directory: 'content/timeline',
    extension: '.yml',
    format: 'yaml',
    schema: timelineSchema,
    defaultWorkflow: 'publish',
    slugField: 'id',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'title', type: 'string', required: true },
      { name: 'start', type: 'string', required: true },
      { name: 'end', type: 'string' },
      { name: 'places', type: 'string[]' },
      { name: 'sources', type: 'string[]' },
      { name: 'summary', type: 'string' },
      { name: 'tags', type: 'string[]' },
      { name: 'certainty', type: 'string' },
    ],
    resolvePath: async (_client, slug) => {
      const normalized = slug.trim()
      return path.posix.join('content/timeline', `${normalized}.yml`)
    },
  },
  {
    id: 'bibliography',
    label: 'Bibliography',
    singleFile: 'data/bibliography.json',
    directory: 'data',
    extension: '.json',
    format: 'json',
    schema: z.array(z.any()),
    defaultWorkflow: 'publish',
    slugField: 'slug',
    fields: [],
    resolvePath: async () => 'data/bibliography.json',
  },
  {
    id: 'gazetteer',
    label: 'Gazetteer',
    singleFile: 'data/gazetteer.json',
    directory: 'data',
    extension: '.json',
    format: 'json',
    schema: z.array(z.any()),
    defaultWorkflow: 'publish',
    slugField: 'slug',
    fields: [],
    resolvePath: async () => 'data/gazetteer.json',
  },
]

export type CollectionId = (typeof collections)[number]['id']

export const getCollection = (id: string) => collections.find((collection) => collection.id === id)

export const getEntryPath = (collection: CollectionDefinition, slug: string, extension?: string) => {
  const ext = extension ?? collection.extension
  return path.posix.join(collection.directory, `${slug}${ext}`)
}

export const listCollectionIds = () => collections.map((collection) => collection.id)
