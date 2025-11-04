import crypto from 'crypto'

type Issue = {
  path: (string | number)[]
  message: string
}

export class ZodError extends Error {
  issues: Issue[]

  constructor(issues: Issue[]) {
    super(issues.map((issue) => issue.message).join('\n'))
    this.name = 'ZodError'
    this.issues = issues
  }
}

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError }

abstract class BaseSchema<T> {
  abstract _parse(input: unknown, path: (string | number)[]): T

  parse(input: unknown): T {
    return this._parse(input, [])
  }

  safeParse(input: unknown): ParseResult<T> {
    try {
      return { success: true, data: this.parse(input) }
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, error }
      }
      throw error
    }
  }

  optional(): BaseSchema<T | undefined> {
    const inner = this
    return new (class extends BaseSchema<T | undefined> {
      _parse(input: unknown, path: (string | number)[]): T | undefined {
        if (input === undefined || input === null) {
          return undefined
        }
        return inner._parse(input, path)
      }
    })()
  }

  default(value: T): BaseSchema<T> {
    const inner = this
    return new (class extends BaseSchema<T> {
      _parse(input: unknown, path: (string | number)[]): T {
        if (input === undefined || input === null || input === '') {
          return typeof value === 'function' ? (value as unknown as () => T)() : value
        }
        return inner._parse(input, path)
      }
    })()
  }
}

class ZodString extends BaseSchema<string> {
  private checks: ((value: string, path: (string | number)[]) => void)[] = []

  _parse(input: unknown, path: (string | number)[]): string {
    if (typeof input !== 'string') {
      throw new ZodError([{ path, message: 'Expected string' }])
    }
    for (const check of this.checks) {
      check(input, path)
    }
    return input
  }

  nonempty(message = 'Required'): ZodString {
    this.checks.push((value, path) => {
      if (value.trim().length === 0) {
        throw new ZodError([{ path, message }])
      }
    })
    return this
  }

  min(length: number, message?: string): ZodString {
    this.checks.push((value, path) => {
      if (value.length < length) {
        throw new ZodError([{ path, message: message ?? `Must be at least ${length} characters` }])
      }
    })
    return this
  }

  max(length: number, message?: string): ZodString {
    this.checks.push((value, path) => {
      if (value.length > length) {
        throw new ZodError([{ path, message: message ?? `Must be at most ${length} characters` }])
      }
    })
    return this
  }

  regex(regex: RegExp, message = 'Invalid format'): ZodString {
    this.checks.push((value, path) => {
      if (!regex.test(value)) {
        throw new ZodError([{ path, message }])
      }
    })
    return this
  }

  email(message = 'Invalid email'): ZodString {
    return this.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message)
  }
}

class ZodBoolean extends BaseSchema<boolean> {
  _parse(input: unknown, path: (string | number)[]): boolean {
    if (typeof input !== 'boolean') {
      throw new ZodError([{ path, message: 'Expected boolean' }])
    }
    return input
  }
}

class ZodNumber extends BaseSchema<number> {
  _parse(input: unknown, path: (string | number)[]): number {
    if (typeof input !== 'number' || Number.isNaN(input)) {
      throw new ZodError([{ path, message: 'Expected number' }])
    }
    return input
  }
}

class ZodArray<T> extends BaseSchema<T[]> {
  constructor(private readonly element: BaseSchema<T>) {
    super()
  }

  _parse(input: unknown, path: (string | number)[]): T[] {
    if (!Array.isArray(input)) {
      throw new ZodError([{ path, message: 'Expected array' }])
    }
    return input.map((value, index) => this.element._parse(value, [...path, index]))
  }
}

class ZodLiteral<T> extends BaseSchema<T> {
  constructor(private readonly literal: T) {
    super()
  }

  _parse(input: unknown, path: (string | number)[]): T {
    if (input !== this.literal) {
      throw new ZodError([{ path, message: `Expected literal ${this.literal}` }])
    }
    return this.literal
  }
}

class ZodEnum<T extends readonly [string, ...string[]]> extends BaseSchema<T[number]> {
  constructor(private readonly values: T) {
    super()
  }

  _parse(input: unknown, path: (string | number)[]): T[number] {
    if (typeof input !== 'string' || !this.values.includes(input as T[number])) {
      throw new ZodError([{ path, message: `Expected one of: ${this.values.join(', ')}` }])
    }
    return input as T[number]
  }
}

class ZodRecord<T> extends BaseSchema<Record<string, T>> {
  constructor(private readonly valueSchema: BaseSchema<T>) {
    super()
  }

  _parse(input: unknown, path: (string | number)[]): Record<string, T> {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new ZodError([{ path, message: 'Expected object' }])
    }
    const result: Record<string, T> = {}
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      result[key] = this.valueSchema._parse(value, [...path, key])
    }
    return result
  }
}

class ZodObject<T extends Record<string, any>> extends BaseSchema<T> {
  constructor(private readonly shape: { [K in keyof T]: BaseSchema<T[K]> }) {
    super()
  }

  _parse(input: unknown, path: (string | number)[]): T {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new ZodError([{ path, message: 'Expected object' }])
    }
    const entries = input as Record<string, unknown>
    const result: Record<string, unknown> = {}
    const issues: Issue[] = []
    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key]
      try {
        result[key] = schema._parse(entries[key], [...path, key])
      } catch (error) {
        if (error instanceof ZodError) {
          issues.push(...error.issues)
        } else {
          throw error
        }
      }
    }
    if (issues.length > 0) {
      throw new ZodError(issues)
    }
    return result as T
  }
}

class ZodUnion<T> extends BaseSchema<T> {
  constructor(private readonly options: BaseSchema<any>[]) {
    super()
  }

  _parse(input: unknown, path: (string | number)[]): T {
    const issues: Issue[] = []
    for (const option of this.options) {
      try {
        return option._parse(input, path)
      } catch (error) {
        if (error instanceof ZodError) {
          issues.push(...error.issues)
        } else {
          throw error
        }
      }
    }
    throw new ZodError(issues.length ? issues : [{ path, message: 'Invalid input' }])
  }
}

class ZodEffects<I, O> extends BaseSchema<O> {
  constructor(private readonly schema: BaseSchema<I>, private readonly transform: (input: I) => O) {
    super()
  }

  _parse(input: unknown, path: (string | number)[]): O {
    const parsed = this.schema._parse(input, path)
    return this.transform(parsed)
  }
}

const string = () => new ZodString()
const boolean = () => new ZodBoolean()
const number = () => new ZodNumber()
const array = <T>(schema: BaseSchema<T>) => new ZodArray(schema)
const literal = <T>(value: T) => new ZodLiteral(value)
const enumeration = <T extends readonly [string, ...string[]]>(values: T) => new ZodEnum(values)
const record = <T>(schema: BaseSchema<T>) => new ZodRecord(schema)
const object = <T extends Record<string, any>>(shape: { [K in keyof T]: BaseSchema<T[K]> }) =>
  new ZodObject(shape)
const union = <T>(options: BaseSchema<any>[]) => new ZodUnion<T>(options)
const effects = <I, O>(schema: BaseSchema<I>, transform: (input: I) => O) => new ZodEffects(schema, transform)

export const z = {
  string,
  boolean,
  number,
  array,
  object,
  literal,
  enum: enumeration,
  record,
  union,
  effects,
  ZodError,
}

export type ZodSchema<T> = BaseSchema<T>

export type infer<T extends ZodSchema<any>> = T extends ZodSchema<infer U> ? U : never

export const createId = () => crypto.randomBytes(16).toString('hex')
