import path from 'path'
import { z } from './zod'

export type Workflow = 'draft' | 'publish'
export type CollectionFormat = 'markdown' | 'json'

export type CollectionDefinition = {
  id: string
  label: string
  directory: string
  extension: '.md' | '.json'
  format: CollectionFormat
  schema: ReturnType<typeof z.object>
  defaultWorkflow: Workflow
  slugField: string
  bodyField?: string
  fields: { name: string; type: string; required?: boolean }[]
}

export const collections: CollectionDefinition[] = [
  {
    id: 'chapters_en',
    label: 'Chapters (English)',
    directory: 'content/chapters/en',
    extension: '.md',
    format: 'markdown',
    schema: z.object({
      title: z.string().nonempty('Title is required'),
      slug: z.string().nonempty('Slug is required'),
      date: z.string().optional(),
      tags: z.array(z.string()).optional(),
      summary: z.string().optional(),
    }),
    defaultWorkflow: 'draft',
    slugField: 'slug',
    bodyField: 'body',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true },
      { name: 'date', type: 'string' },
      { name: 'tags', type: 'string[]' },
      { name: 'summary', type: 'string' },
      { name: 'body', type: 'markdown' },
    ],
  },
  {
    id: 'chapters_ar',
    label: 'Chapters (Arabic)',
    directory: 'content/chapters/ar',
    extension: '.md',
    format: 'markdown',
    schema: z.object({
      title: z.string().nonempty('Title is required'),
      slug: z.string().nonempty('Slug is required'),
      date: z.string().optional(),
      tags: z.array(z.string()).optional(),
      summary: z.string().optional(),
    }),
    defaultWorkflow: 'draft',
    slugField: 'slug',
    bodyField: 'body',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true },
      { name: 'date', type: 'string' },
      { name: 'tags', type: 'string[]' },
      { name: 'summary', type: 'string' },
      { name: 'body', type: 'markdown' },
    ],
  },
  {
    id: 'timeline_content',
    label: 'Timeline Content',
    directory: 'content/timeline/content',
    extension: '.md',
    format: 'markdown',
    schema: z.object({
      title: z.string().nonempty(),
      slug: z.string().nonempty(),
      era: z.string().optional(),
      featured: z.boolean().optional(),
    }),
    defaultWorkflow: 'draft',
    slugField: 'slug',
    bodyField: 'body',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true },
      { name: 'era', type: 'string' },
      { name: 'featured', type: 'boolean' },
      { name: 'body', type: 'markdown' },
    ],
  },
  {
    id: 'timeline_data',
    label: 'Timeline Data',
    directory: 'content/timeline/data',
    extension: '.json',
    format: 'json',
    schema: z.object({
      slug: z.string().nonempty(),
      title: z.string().nonempty(),
      date: z.string().optional(),
      events: z.array(
        z.object({
          id: z.string().nonempty(),
          label: z.string().nonempty(),
          description: z.string().optional(),
          date: z.string().optional(),
        }),
      ),
    }),
    defaultWorkflow: 'publish',
    slugField: 'slug',
    fields: [
      { name: 'slug', type: 'string', required: true },
      { name: 'title', type: 'string', required: true },
      { name: 'date', type: 'string' },
      { name: 'events', type: 'Event[]' },
    ],
  },
  {
    id: 'bibliography',
    label: 'Bibliography',
    directory: 'content/bibliography',
    extension: '.md',
    format: 'markdown',
    schema: z.object({
      title: z.string().nonempty(),
      slug: z.string().nonempty(),
      authors: z.array(z.string()).optional(),
      year: z.string().optional(),
    }),
    defaultWorkflow: 'publish',
    slugField: 'slug',
    bodyField: 'body',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true },
      { name: 'authors', type: 'string[]' },
      { name: 'year', type: 'string' },
      { name: 'body', type: 'markdown' },
    ],
  },
  {
    id: 'gazetteer',
    label: 'Gazetteer',
    directory: 'content/gazetteer',
    extension: '.md',
    format: 'markdown',
    schema: z.object({
      title: z.string().nonempty(),
      slug: z.string().nonempty(),
      region: z.string().optional(),
      coordinates: z.array(z.number()).optional(),
    }),
    defaultWorkflow: 'publish',
    slugField: 'slug',
    bodyField: 'body',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true },
      { name: 'region', type: 'string' },
      { name: 'coordinates', type: 'number[]' },
      { name: 'body', type: 'markdown' },
    ],
  },
]

export type CollectionId = (typeof collections)[number]['id']

export const getCollection = (id: string) => collections.find((collection) => collection.id === id)

export const getEntryPath = (collection: CollectionDefinition, slug: string, extension?: string) => {
  const ext = extension ?? collection.extension
  return path.posix.join(collection.directory, `${slug}${ext}`)
}

export const listCollectionIds = () => collections.map((collection) => collection.id)
