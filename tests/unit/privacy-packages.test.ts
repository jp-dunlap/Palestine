import { describe, it, expect } from 'vitest'
import pkg from '../../package.json'

describe('privacy: banned runtime packages are absent', () => {
  const banned = ['@vercel/analytics', '@vercel/speed-insights']

  it('removes proprietary tracking libs from dependencies', () => {
    const deps = Object.keys(pkg.dependencies ?? {})
    for (const name of banned) {
      expect(deps).not.toContain(name)
    }
  })
})
